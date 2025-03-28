import { useEffect, useState } from "react";
import Tooltip from "./Basic/Tooltip";
import { EpisodeState, IProgress, IQueueEpisode } from "../types";
import { listen } from "@tauri-apps/api/event";

export interface QueueEpisodeProps {
	queueEpisode: IQueueEpisode;
}

const QueueEpisode = ({ queueEpisode }: QueueEpisodeProps) => {
	const [expanded, setExpanded] = useState(false);
	const [percentage, setPercentage] = useState(0);
	const [state, setState] = useState<string>(queueEpisode.state.valueOf());

	useEffect(() => {
		// Event-Listener für Queue-Updates
		listen<IQueueEpisode>(
			`episode_updated_${queueEpisode.index}`,
			(event) => {
				setPercentage(event.payload.progress.percentage);
				setState(event.payload.state.valueOf());
			}
		);
	}, []);

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
								(state == EpisodeState.Waiting.valueOf() &&
									"") ||
								(state == EpisodeState.Fetching.valueOf() &&
									"w-full bg-slate-400") ||
								(state == EpisodeState.Downloading.valueOf() &&
									"bg-indigo-700") ||
								(state == EpisodeState.Paused.valueOf() &&
									"bg-slate-700") ||
								(state == EpisodeState.Success.valueOf() &&
									"w-full bg-emerald-500") ||
								(state == EpisodeState.Failed.valueOf() &&
									"w-full bg-red-500")
							} absolute h-full rounded-full transition-all`}
							style={{ width: percentage.toString() + "%" }}
						></div>
					</div>
				</div>

				{/* Button Panel */}
				<div className="flex flex-row space-x-2 items-center">
					{(state == EpisodeState.Downloading.valueOf() ||
						state == EpisodeState.Paused.valueOf()) && (
						<Tooltip content={<p>Toggle episode details.</p>}>
							<button
								onClick={() => setExpanded((prev) => !prev)}
								className="material-symbols-rounded p-1 bg-slate-100 rounded-md cursor-pointer hover:bg-slate-200 !aspect-square"
							>
								more_horiz
							</button>
						</Tooltip>
					)}

					{(state == EpisodeState.Success.valueOf() ||
						state == EpisodeState.Failed.valueOf()) && (
						<Tooltip content={<p>Requeue episode.</p>}>
							<button
								onClick={() => setExpanded((prev) => !prev)}
								className="material-symbols-rounded p-1 bg-slate-100 rounded-md cursor-pointer hover:bg-slate-200 !aspect-square"
							>
								sync
							</button>
						</Tooltip>
					)}

					<Tooltip content={<p>Remove episode.</p>}>
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
