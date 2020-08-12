import React, { useState } from "react";
import classNames from "classnames";

import Link from "next/link";
import { useRouter } from "next/router";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";

import { removeCookie } from "../utils/cookie";

import packageJSON from "../package.json";

import { useAuthenticatedQuery } from "../gql/Authenticated.graphql";

const { NEXT_PUBLIC_LOGIN_URL = "/" } = process.env;

export const Navbar = () => {
	const [isActive, setIsActive] = useState(false);

	const { data } = useAuthenticatedQuery();
	const { authenticated, user } = data?.authenticated ?? {};

	return (
		<nav className="navbar" role="navigation" aria-label="main navigation">
			<div className="navbar-brand">
				<Link href="/" passHref={true}>
					<a className="navbar-item">
						<img src="/images/Fortify_WIP.png" width="100" />
					</a>
				</Link>

				<a
					role="button"
					className={classNames("navbar-burger", "burger", {
						"is-active": isActive,
					})}
					aria-label="menu"
					aria-expanded="false"
					data-target="navbarBasicExample"
					onClick={() => setIsActive(!isActive)}
				>
					<span aria-hidden="true"></span>
					<span aria-hidden="true"></span>
					<span aria-hidden="true"></span>
				</a>
			</div>

			<div
				id="navbarBasicExample"
				className={classNames("navbar-menu", {
					"is-active": isActive,
				})}
			>
				<div className="navbar-start">
					<NavbarLink href="/matches" value="Matches" />
					{authenticated && (
						<NavbarLink href="/lobby" value="My Lobby" />
					)}
				</div>

				<div className="navbar-end">
					{authenticated && (
						<NavbarLink
							href="/profile/[id]"
							as={`/profile/${user?.steamid ?? 0}`}
							value="My Profile"
						/>
					)}
					{!authenticated && (
						<div className="navbar-item">
							<div className="buttons">
								<a
									className="button is-primary is-inverted"
									href={NEXT_PUBLIC_LOGIN_URL}
								>
									Log in
								</a>
							</div>
						</div>
					)}
					{authenticated && (
						<div className="navbar-item has-dropdown is-hoverable">
							<a className="navbar-link">
								<span className="icon has-text-info">
									<FontAwesomeIcon
										icon={faCog}
										color="white"
									/>
								</span>
							</a>

							<div className="navbar-dropdown is-right">
								<a
									className="navbar-item"
									target="_blank"
									href="https://github.com/Fortify-Labs/Fortify/issues"
								>
									Report a bug
								</a>
								<a
									className="navbar-item"
									onClick={() => {
										removeCookie("auth");
										document.location.href = "/";
									}}
								>
									Logout
								</a>
								<hr className="navbar-divider" />
								<div className="navbar-item">
									Version {packageJSON.version}
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</nav>
	);
};

const NavbarLink = ({
	href,
	value,
	as,
}: {
	href: string;
	value: string;
	as?: string;
}) => {
	const router = useRouter();
	const route = href.replace("/", "");

	return (
		<Link href={href} passHref={true} as={as}>
			<a
				className={classNames("navbar-item", {
					"is-active": router.route == route,
				})}
			>
				{value}
			</a>
		</Link>
	);
};
