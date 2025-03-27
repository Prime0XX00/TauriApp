import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";
import Tooltip from "../Basic/Tooltip";
import Queue from "../Queue";

const Home = () => {
	const [expanded, setExpanded] = useState(false);

	const handleClickSearch = async () => {
		await invoke("cmd_create_search_window");
	};
	const handleClickSettings = () => {
		setExpanded((prev) => !prev);
	};

	return (
		<div className="text-slate-700 max-w-screen h-screen w-screen overflow-x-hidden">
			{/* Content */}
			<div className="relative h-full w-full flex">
				{/* Page-Content */}
				<div className="relative p-2 flex flex-row grow space-x-2 justify-end w-fit">
					<Queue></Queue>

					{/* Button-Panel */}
					<div className="flex flex-col space-y-2">
						<button
							id="expand"
							onClick={handleClickSettings}
							className="material-symbols-rounded bg-slate-200 hover:bg-slate-300 rounded-full p-1"
						>
							settings
						</button>
						<Tooltip
							targetId="expand"
							position="left"
						>
							Klicken, um Einstellungen zu öffnen.
						</Tooltip>

						<button
							id="search"
							onClick={handleClickSearch}
							className="material-symbols-rounded bg-slate-200 hover:bg-slate-300 rounded-full p-1"
						>
							search
						</button>
						<Tooltip
							targetId="search"
							position="left"
						>
							Klicken, um nach Serien zu suchen.
						</Tooltip>
					</div>
				</div>

				{/* Sidebar */}
				<div
					className={`${
						expanded ? "mr-0" : "-mr-96"
					} w-96 flex flex-col bg-slate-200 transition-all`}
				></div>
			</div>
		</div>
	);
};

export default Home;
