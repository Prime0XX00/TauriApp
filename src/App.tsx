import { Routes, Route } from "react-router";
import { BrowserRouter } from "react-router";
import Search from "./components/Pages/Search";
import SeriesOverview from "./components/Pages/SeriesOverview";
import { createContext, useEffect } from "react";
import { IEpisode, IQueueEpisode, ISeason } from "./types";
import AppLayout from "./components/Layouts/AppLayout";
import { Queue } from "./components/Pages/Queue";
import { listen } from "@tauri-apps/api/event";

interface QueueContext {
	queue?: IQueueEpisode[];
	addEpisodeToQueue?: (episode: IEpisode) => void;
	addSeasonToQueue?: (season: ISeason) => void;
}
const handleAddEpisode = (episode: IEpisode) => {};
const handleAddSeason = (season: ISeason) => {};

const queueContextValue = {
	queue: [],
	addEpisodeToQueue: handleAddEpisode,
	addSeasonToQueue: handleAddSeason,
};

export const QueueContext = createContext<QueueContext>(queueContextValue);

const App = () => {
	return (
		<>
			<QueueContext.Provider value={queueContextValue}>
				<BrowserRouter>
					<Routes>
						<Route
							path="/"
							element={<AppLayout></AppLayout>}
						>
							<Route
								index
								element={<Queue />}
							/>
							<Route
								path="series"
								element={<SeriesOverview />}
							/>
							<Route
								path="search"
								element={<Search />}
							/>
						</Route>
					</Routes>
				</BrowserRouter>
			</QueueContext.Provider>
		</>
	);
};

export default App;
function setQueue(payload: any) {
	throw new Error("Function not implemented.");
}
