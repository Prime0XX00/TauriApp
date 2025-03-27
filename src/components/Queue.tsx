import React, { useEffect, useState } from "react";
import { IEpisode, IQueueEpisode } from "../types";
import QueueEpisode from "./QueueEpisode";
import { listen } from "@tauri-apps/api/event";

const Queue = () => {
	const [queue, setQueue] = useState<IQueueEpisode[]>();

	useEffect(() => {
		// Event-Listener für Queue-Updates
		const unlisten = listen("queue_updated", (event) => {
			console.log("Neue Queue:", event.payload);
			//setQueue(event?.payload);
		});
	}, []);

	return (
		<div className="flex grow">
			<div className="flex flex-col w-96 space-y-2 mx-auto">
				{queue?.map((item) => (
					//<QueueEpisode queueEpisode={item}></QueueEpisode>
					<div></div>
				))}
			</div>
		</div>
	);
};

export default Queue;
