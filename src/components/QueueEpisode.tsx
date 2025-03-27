import { useState } from "react";
import Tooltip from "./Basic/Tooltip";
import { IQueueEpisode } from "../types";

export enum EpisodeState {
	Waiting,
	Fetching,
	Downloading,
	Paused,
	Successful,
	Failed,
}

export interface QueueEpisodeProps {
	queueEpisode: IQueueEpisode;
	state: EpisodeState;
}

const QueueEpisode = ({
	queueEpisode,
	state = EpisodeState.Downloading,
}: QueueEpisodeProps) => {
	const [expanded, setExpanded] = useState(false);

	return (
		<div className="bg-white border first:border-t border-t-0 first:rounded-t-md last:rounded-b-md flex flex-col space-y-3 border-slate-200 px-5 py-5">
			<div className="flex space-x-5 justify-between">
				{/* Main */}
				<div className="flex flex-col space-y-1 grow">
					{/* Text */}
					<div className="flex flex-row justify-between">
						<div className="flex space-x-5">
							<p className="w-fit font-semibold">
								{queueEpisode.episode.seriesName}
							</p>
							<p className="w-fit">
								{queueEpisode.episode.seasonName}
							</p>
							<p className="w-fit">
								{queueEpisode.episode.index}
							</p>
						</div>
						<div className="">--:--.-- / --:--.--</div>
					</div>
					{/* Loading Bar */}
					<div className="relative h-2">
						<div className="absolute w-full h-full bg-slate-100 rounded-full"></div>
						<div
							className={`${
								(state == EpisodeState.Waiting && "") ||
								(state == EpisodeState.Fetching &&
									"w-full bg-slate-400") ||
								(state == EpisodeState.Downloading &&
									"bg-indigo-700") ||
								(state == EpisodeState.Paused &&
									"bg-slate-700") ||
								(state == EpisodeState.Successful &&
									"w-full bg-emerald-500") ||
								(state == EpisodeState.Failed &&
									"w-full bg-red-500")
							} absolute w-1/2 h-full rounded-full transition-all`}
						></div>
					</div>
				</div>

				{/* Button Panel */}
				<div className="flex flex-row space-x-2 items-center">
					{(state == EpisodeState.Downloading ||
						state == EpisodeState.Paused) && (
						<Tooltip content={<p>Toggle episode details.</p>}>
							<button
								onClick={() => setExpanded((prev) => !prev)}
								className="material-symbols-rounded p-1 bg-slate-100 rounded-md cursor-pointer hover:bg-slate-200 !aspect-square"
							>
								more_horiz
							</button>
						</Tooltip>
					)}

					{(state == EpisodeState.Successful ||
						state == EpisodeState.Failed) && (
						<Tooltip content={<p>Requeue episode.</p>}>
							<button
								onClick={() => setExpanded((prev) => !prev)}
								className="material-symbols-rounded p-1 bg-slate-100 rounded-md cursor-pointer hover:bg-slate-200 !aspect-square"
							>
								sync
							</button>
						</Tooltip>
					)}

					<Tooltip content={<p>Remove episode from queue.</p>}>
						<button className="material-symbols-rounded p-1 bg-red-500 text-white rounded-md cursor-pointer hover:bg-red-600 !aspect-square">
							delete_forever
						</button>
					</Tooltip>
				</div>
			</div>
			{expanded && (
				<div className="grid grid-cols-3 text-slate-500">
					<p>Größe: 232MB</p>
					<p>Frame: 1548</p>
					<p>Speed: 12x</p>
				</div>
			)}
		</div>
	);
};

export default QueueEpisode;
