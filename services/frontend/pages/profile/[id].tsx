import withApollo from "../../lib/with-apollo";
import { Navbar } from "../../components/navbar";
import { useRouter } from "next/router";
import { useProfileQuery } from "../../gql/Profile.graphql";
import { VStack } from "../../components/vstack";
import { HStack } from "../../components/hstack";

import Link from "next/link";

import { BigNumber } from "bignumber.js";
import classNames from "classnames";
import { RecentMatchesTable } from "../../components/profile/recentMatches";
import { MmrHistory } from "../../components/profile/mmrHistory";
import { NextSeo } from "next-seo";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSteam, faTwitch } from "@fortawesome/free-brands-svg-icons";

const { NEXT_PUBLIC_URL } = process.env;

const Profile = () => {
	const router = useRouter();
	const { id } = router.query;
	const { data, loading, error } = useProfileQuery({
		variables: { steamid: id?.toString() },
	});
	const { profile } = data ?? {};

	const tabContents = {
		matches: <RecentMatchesTable steamid={id?.toString()} />,
		mmrHistory: <MmrHistory steamid={id?.toString()} />,
	};
	const tab = Object.keys(tabContents).includes(
		router.query.tab?.toString() ?? ""
	)
		? (router.query.tab?.toString() as keyof typeof tabContents)
		: "matches";

	return (
		<>
			<NextSeo
				title={`${profile?.name ?? "Private"} Profile | Fortify`}
				description={`Rank: ${profile?.rank ?? 0}; MMR: ${
					profile?.mmr ?? 0
				}; Leaderboard Rank: ${profile?.leaderboardRank ?? 0}`}
				openGraph={{
					url: `${NEXT_PUBLIC_URL}/profile/${profile?.steamid}`,
					title: `${profile?.name ?? "Private"} Profile | Fortify`,
					description: `Rank: ${profile?.rank ?? 0}; MMR: ${
						profile?.mmr ?? 0
					}; Leaderboard Rank: ${profile?.leaderboardRank ?? 0}`,
				}}
			/>

			<Navbar />

			{loading && <div>Loading...</div>}

			{error && (
				<p>
					{error.name} - {error.message}
				</p>
			)}

			{!loading && !error && (
				<div style={{ margin: "1rem" }}>
					<div className="columns">
						<div className="column is-narrow">
							<div className="box">
								<VStack>
									<HStack style={{ alignItems: "center" }}>
										<figure
											className="image is-96x96"
											style={{ marginRight: "2rem" }}
										>
											<img
												className="is-rounded"
												src={
													profile?.profilePicture ??
													"https://bulma.io/images/placeholders/128x128.png"
												}
											/>
										</figure>
										Username: {profile?.name} <br /> <br />
										Rank Name: {profile?.rank} <br />
										MMR: {profile?.mmr} <br />
										Rank: {profile?.leaderboardRank}
									</HStack>

									<div className="content">
										<ul style={{ marginLeft: "1rem" }}>
											<a
												href={`https://steamcommunity.com/profiles/${new BigNumber(
													profile?.steamid ?? ""
												).plus("76561197960265728")}`}
												target="_blank"
											>
												<FontAwesomeIcon
													icon={faSteam}
													size="1x"
												/>{" "}
												Steam
											</a>
										</ul>
										{profile?.twitchName && (
											<ul style={{ marginLeft: "1rem" }}>
												<a
													href={`https://twitch.tv/${profile?.twitchName.replace(
														"#",
														""
													)}`}
													target="_blank"
												>
													<FontAwesomeIcon
														icon={faTwitch}
														size="1x"
													/>{" "}
													Twitch
												</a>
											</ul>
										)}
										{/* <ul style={{ marginLeft: "1rem" }}>
											<a href="" target="_blank">
												Discord
											</a>
										</ul> */}
									</div>
								</VStack>
							</div>
						</div>

						<div className="column">
							<div className="box">
								<div className="tabs">
									<ul>
										<li
											className={classNames({
												"is-active": tab == "matches",
											})}
										>
											<Link
												href="/profile/[id]?tab=matches"
												as={`/profile/${id?.toString()}?tab=matches`}
												passHref
											>
												<a>Recent Matches</a>
											</Link>
										</li>
										<li
											className={classNames({
												"is-active":
													tab == "mmrHistory",
											})}
										>
											<Link
												href="/profile/[id]?tab=mmrHistory"
												as={`/profile/${id?.toString()}?tab=mmrHistory`}
												passHref
											>
												<a>MMR / Rank History</a>
											</Link>
										</li>
									</ul>
								</div>

								<div className="container">
									{tabContents[tab]}
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default withApollo(Profile);
