import { MatchPlayer } from "definitions/match";
import React, { FunctionComponent } from "react";
import { units } from "@shared/units";
import { currentSeason } from "@shared/season";
import Image from "next/image";

const cellCount = 8;
const rowCount = 8;

const currentSeasonUnits = units[currentSeason];

export interface BoardUnit {
	id: number;
	dota_unit_name: string;
	rank: number;
}

export const BoardComponent: FunctionComponent<{
	player?: MatchPlayer;
	personaName: string;
	opponent?: MatchPlayer;
	flip?: boolean;
	renderUnits?: boolean;
}> = React.memo(
	({ player, personaName, opponent, flip = false, renderUnits = true }) => {
		// --- UI variables ---
		const playerUnits = player?.public_player_state?.units ?? [];

		const opponentUnits = opponent?.public_player_state?.units ?? [];

		const indexedUnits: (BoardUnit | undefined)[][] = [];

		// Create empty 2d array
		for (let cellIndex = 0; cellIndex < cellCount; cellIndex++) {
			indexedUnits[cellIndex] = [];

			for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
				indexedUnits[cellIndex][rowIndex] = undefined;
			}
		}

		// Fill indexed units array
		for (let cellIndex = 0; cellIndex < cellCount; cellIndex++) {
			const rotatedCellIndex = 7 - cellIndex;

			for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
				const rotatedRowIndex = 7 - rowIndex;

				// Insert player units into 2d indexed array
				const unit = playerUnits.find(
					(unit) =>
						unit?.position.x == cellIndex &&
						unit?.position.y == rowIndex
				);

				if (unit) {
					const dota_unit_name =
						Object.values(currentSeasonUnits).find(
							({ id }) => id == unit.unit_id
						)?.dota_unit_name ?? "";

					if (flip) {
						indexedUnits[cellIndex][rowIndex] = {
							id: unit.unit_id,
							rank: unit.rank,
							dota_unit_name,
						};
					} else {
						indexedUnits[rotatedCellIndex][rotatedRowIndex] = {
							id: unit.unit_id,
							rank: unit.rank,
							dota_unit_name,
						};
					}
				}

				// Insert opposing units into 2d array
				const opponentUnit = opponentUnits.find(
					(unit) =>
						unit?.position.x == cellIndex &&
						unit?.position.y == rowIndex
				);

				if (opponentUnit) {
					const dota_unit_name =
						Object.values(currentSeasonUnits).find(
							({ id }) => id == opponentUnit.unit_id
						)?.dota_unit_name ?? "";

					if (flip) {
						indexedUnits[rotatedCellIndex][rotatedRowIndex] = {
							id: opponentUnit.unit_id,
							rank: opponentUnit.rank,
							dota_unit_name,
						};
					} else {
						indexedUnits[cellIndex][rowIndex] = {
							id: opponentUnit.unit_id,
							rank: opponentUnit.rank,
							dota_unit_name,
						};
					}
				}
			}
		}

		return (
			<>
				{personaName} <br />
				<div className="box" style={{ margin: "1em" }}>
					<div
						style={{
							width: "100%",
							height: "100%",
							display: "flex",
							flexWrap: "wrap",
							overflow: "hidden",
						}}
					>
						{new Array(rowCount * cellCount)
							.fill(0)
							.map((_a, index) => {
								const cellIndex = index % 8;
								const rowIndex = (index - cellIndex) / 8;

								const unit = indexedUnits[cellIndex][rowIndex];

								return (
									<div
										key={`field_${index}`}
										style={{
											width: `${100 / 8}%`,
											background: "#1f2424",
											border: "1px #c7c9d3 solid",
											textAlign: "center",

											...(!unit
												? {
														paddingTop: `${
															100 / 16
														}%`,
														paddingBottom: `${
															100 / 16
														}%`,
												  }
												: {}),
										}}
									>
										{unit && renderUnits && (
											<UnitIcon
												dota_unit_name={
													unit.dota_unit_name
												}
											/>
										)}
									</div>
								);
							})}
					</div>
				</div>
			</>
		);
	}
);

const UnitIcon: FunctionComponent<{ dota_unit_name: string }> = ({
	dota_unit_name,
}) => (
	<figure className="image">
		<Image
			src={`/units/panorama/images/heroes/icons/${dota_unit_name}_png.png`}
			loading="lazy"
			width="64"
			height="64"
		/>
	</figure>
);
