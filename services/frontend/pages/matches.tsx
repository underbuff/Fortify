import withApollo from "../lib/with-apollo";
import { Navbar } from "../components/navbar";
import { useCurrentMatchesQuery } from "../gql/CurrentMatches.graphql";
import { NextSeo } from "next-seo";

const { NEXT_PUBLIC_URL } = process.env;

const Matches = () => {
	const { loading, data, error } = useCurrentMatchesQuery({
		variables: {
			limit: 50,
			offset: 0,
		},
	});

	return (
		<>
			<NextSeo
				title="Matches | Fortify"
				description="Currently ongoing Dota Underlords matches"
				openGraph={{
					url: `${NEXT_PUBLIC_URL}/matches`,
					title: "Matches | Fortify",
					description: "Currently ongoing Dota Underlords matches",
				}}
			/>

			<Navbar />

			<div
				style={{
					margin: "1rem",
				}}
			>
				<div className="tabs">
					<ul>
						<li className="is-active">
							<a>Live Matches</a>
						</li>
						<li>
							<a style={{ textDecoration: "line-through" }}>
								Past Matches
							</a>
						</li>
					</ul>
				</div>

				<div style={{ overflowX: "auto" }}>
					<table className="table is-fullwidth is-hoverable is-striped">
						<thead>
							<tr>
								<th>Average MMR</th>
								<th style={{ textDecoration: "line-through" }}>
									Round
								</th>
								<th>Duration</th>
								<th>Notable Players</th>
							</tr>
						</thead>
						{loading && (
							<tbody>
								<tr>
									<th>Loading...</th>
								</tr>
							</tbody>
						)}
						{error && (
							<p>
								{error.name} - {error.message}
							</p>
						)}
						{!loading && !error && (
							<tbody>
								{data?.currentMatches?.map((match) => (
									<tr key={match?.id}>
										<th>{match?.averageMMR}</th>
										<th></th>
										<th>{match?.duration}</th>
										<th>
											{match?.slots?.map((slot) => {
												const name =
													slot?.user?.name ?? "";
												return `${name ?? ""}${
													name ? "; " : ""
												}`;
											})}
										</th>
									</tr>
								))}
							</tbody>
						)}
					</table>
				</div>
			</div>
		</>
	);
};

export default withApollo(Matches);