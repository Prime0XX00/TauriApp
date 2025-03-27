import { Outlet } from "react-router";
import Tooltip from "../Basic/Tooltip";
import { invoke } from "@tauri-apps/api/core";

const AppLayout = () => {
	const handleClickSearch = async () => {
		await invoke("cmd_create_search_window");
	};

	return (
		<div className="flex flex-row h-screen w-screen text-slate-800">
			{/* Sidebar */}
			<div className="bg-slate-800 flex flex-col space-y-5 items-center p-5">
				<Tooltip
					position="right"
					content={<p>Browse series.</p>}
				>
					<button
						onClick={handleClickSearch}
						className="!text-4xl material-symbols-rounded text-white cursor-pointer p-1 hover:bg-slate-700"
					>
						search
					</button>
				</Tooltip>
				<Tooltip
					position="right"
					content={<p>Configurate settings.</p>}
				>
					<button className="!text-4xl material-symbols-rounded text-white cursor-pointer p-1 hover:bg-slate-700">
						tune
					</button>
				</Tooltip>
				<Tooltip
					position="right"
					content={<p>See download stats.</p>}
				>
					<button className="!text-4xl material-symbols-rounded text-white cursor-pointer p-1 hover:bg-slate-700">
						downloading
					</button>
				</Tooltip>
				<Tooltip
					position="right"
					content={<p>Information and help.</p>}
				>
					<button className="!text-4xl material-symbols-rounded text-white cursor-pointer p-1 hover:bg-slate-700">
						help
					</button>
				</Tooltip>
			</div>

			<Outlet></Outlet>
		</div>
	);
};

export default AppLayout;
