import InfoCard from "../InfoCard";
import QueueEpisode from "../QueueEpisode";
import Tooltip from "../Basic/Tooltip";
import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { IQueueEpisode } from "../../types";

export const Queue = () => {
	useEffect(() => {
		// Event-Listener für Queue-Updates
		const unlisten = listen<IQueueEpisode[]>("queue_updated", (event) => {
			console.log("Neue Queue:", event.payload);
			setQueue(event.payload);
		});
	}, []);

	const [queue, setQueue] = useState<IQueueEpisode[]>();

	return (
		<div className="bg-slate-50 overflow-y-auto w-full">
			<div className="bg-white border-b border-gray-300 px-8 py-5 flex justify-between">
				<p className="text-2xl font-semibold">Queue</p>
				<div>
					<Tooltip
						position="left"
						content={<p>Stop queue.</p>}
					>
						<button className="material-symbols-rounded p-1 bg-red-500 text-white rounded-full cursor-pointer hover:bg-red-600 !aspect-square">
							stop
						</button>
					</Tooltip>
				</div>
			</div>

			<div className="flex flex-col space-y-10 mx-auto w-full p-10">
				<div className="flex justify-between space-x-10">
					<InfoCard
						iconName="hourglass_top"
						text="Awaiting downloads"
						count={4}
					></InfoCard>
					<InfoCard
						iconName="check_circle"
						text="Successful downloads"
						count={9}
					></InfoCard>
					<InfoCard
						iconName="report"
						text="Failed downloads"
						count={2}
					></InfoCard>
				</div>

				<div>
					{queue?.length === 0 && (
						<div className="bg-white border first:border-t border-t-0 first:rounded-t-md last:rounded-b-md flex flex-col space-y-3 border-slate-200 px-5 py-5">
							<p className="text-center">
								No downloads in queue.
							</p>
						</div>
					)}

					{queue?.map((queueEpisode, index) => (
						<QueueEpisode
							queueEpisode={queueEpisode}
						></QueueEpisode>
					))}
				</div>
			</div>
		</div>
	);
};
