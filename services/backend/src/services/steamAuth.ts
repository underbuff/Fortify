import { injectable, inject } from "inversify";
import { Application, Router, Request, Response } from "express";

import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";

import passport from "passport";
import { Strategy as SteamStrategy } from "passport-steam";

import { generateJWT, PermissionScope } from "@shared/auth";
import { PostgresConnector } from "@shared/connectors/postgres";
import { User } from "@shared/db/entities/user";

import { convert64to32SteamId } from "@shared/steamid";
import { RedisConnector } from "@shared/connectors/redis";

const {
	APP_URL = "",
	APP_DOMAIN,
	APP_SUCCESSFUL_AUTH_RETURN_URL = "/",
	APP_STEAM_RETURN_URL,
	JWT_SECRET,
	STEAM_WEB_API_KEY,
} = process.env;

export interface NodeSteamPassportProfileJSON {
	steamid: string;
	communityvisibilitystate: number;
	profilestate: number;
	personaname: string;
	profileurl: string;
	avatar: string;
	avatarmedium: string;
	avatarfull: string;
	avatarhash: string;
	lastlogoff: number;
	personastate: number;
	realname: string;
	primaryclanid: string;
	timecreated: number;
	personastateflags: number;
	loccountrycode: string;
}

export interface NodeSteamPassportProfile {
	// OpenID identifier
	identifier: string;

	provider: string;

	_json: NodeSteamPassportProfileJSON;
	id: string;
	displayName: string;
	photos: { value: string }[];
}

@injectable()
export class SteamAuthMiddleware {
	authLimiter: rateLimit.RateLimit;

	constructor(
		@inject(PostgresConnector) private postgres: PostgresConnector,
		@inject(RedisConnector) private redis: RedisConnector,
	) {
		this.authLimiter = rateLimit({
			max: 120,
			store: new RedisStore({
				client: redis.createClient(),
				prefix: "rl:api:steamAuth:",
			}),
		});
	}

	async handleAuth(req: Request, res: Response) {
		const user = req.user as NodeSteamPassportProfile | undefined;

		if (user && JWT_SECRET) {
			// Store user to DB
			const userRepo = await this.postgres.getUserRepo();

			const steamID = convert64to32SteamId(user.id).toString();

			let dbUser = await userRepo.findOne(steamID);

			// If a user account is suspended, do not proceed with authentication
			if (dbUser?.suspended) {
				res.cookie("suspended", true);
				return res.redirect(APP_SUCCESSFUL_AUTH_RETURN_URL);
			}

			if (!dbUser) {
				// If new account sign up is disabled, do not proceed with user sign up
				if (
					(await this.redis.getAsync("backend:signupDisabled")) ===
					"true"
				)
					return res.redirect(APP_SUCCESSFUL_AUTH_RETURN_URL);

				dbUser = new User();

				dbUser.steamid = steamID;
				dbUser.registered = true;
			}
			dbUser.name = user.displayName;
			dbUser.profilePicture = user._json.avatarfull;

			await userRepo.save(dbUser);

			res.cookie(
				"auth",
				await generateJWT(
					{
						user: { id: dbUser.steamid },
						scopes: [PermissionScope.User],
					},
					{ expiresIn: "30 days" },
				),
				{
					expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
					domain: APP_DOMAIN,
				},
			);
		}

		res.redirect(APP_SUCCESSFUL_AUTH_RETURN_URL);
	}

	applyMiddleware({ app }: { app: Application }) {
		passport.use(
			new SteamStrategy(
				{
					apiKey: STEAM_WEB_API_KEY,
					realm: APP_URL,
					returnURL: APP_STEAM_RETURN_URL,
				},
				(
					identifier: string,
					profile: NodeSteamPassportProfile,
					done: (
						err: string | null | undefined,
						profile: NodeSteamPassportProfile,
					) => unknown,
				) => {
					profile.identifier = identifier;
					return done(null, profile);
				},
			),
		);

		const authRouter: Router = Router();
		authRouter.use(passport.initialize());
		authRouter.get(
			"/",
			async (req, res, next) => {
				const loginDisabled =
					(await this.redis.getAsync("backend:loginDisabled")) ===
					"true";

				if (loginDisabled) {
					res.json({ login: "disabled" });
				} else {
					next();
				}
			},
			passport.authenticate("steam"),
		);
		authRouter.get(
			"/return",
			passport.authenticate("steam", {
				failureRedirect: "/fail",
				session: false,
			}),
			this.authLimiter,
			(req, res) => this.handleAuth(req, res),
		);

		app.use("/auth/steam", this.authLimiter, authRouter);
	}
}
