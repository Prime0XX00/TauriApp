import { invoke } from "@tauri-apps/api/core";
import { useCallback, useEffect, useState } from "react";
import { Series } from "../../types";
import Tooltip from "../Basic/Tooltip";

const Search = () => {
	const [allSeries, setAllSeries] = useState<Series[]>();
	const [filteredSeries, setFilteredSeries] = useState<Series[]>();
	const [searchName, setSearchName] = useState("");

	useEffect(() => {
		console.log(searchName.trim());
		if (searchName.trim() == "") {
			setFilteredSeries(allSeries);
			return;
		}

		setFilteredSeries(
			allSeries?.filter((series) => {
				return series.title.includes(searchName);
			})
		);
	}, [searchName, allSeries]);

	useEffect(() => {
		fetchAllSeries();
	}, []);

	const fetchAllSeries = useCallback(async () => {
		const result: Series[] = await invoke("cmd_get_all_series");
		setAllSeries(result);
	}, []);

	const handleClickSeries = (series: Series) => {
		openNewWindow(series);
	};

	const openNewWindow = async (series: Series) => {
		await invoke("cmd_create_series_window", { series: series });
	};

	return (
		<div className="bg-slate-50 overflow-y-auto w-full">
			<div className="flex flex-col mx-auto w-full p-10 space-y-10">
				<div className="flex flex-row w-full items-center space-x-5 sticky">
					<input
						onChange={(e) => setSearchName(e.target.value)}
						className="w-full bg-white border rounded-md border-slate-200 px-2 py-1 focus:outline-none"
						placeholder={"Series..."}
						value={searchName || ""}
					></input>
					<Tooltip
						position="left"
						content={<p>Reset search parameter.</p>}
					>
						<button
							onClick={() => setSearchName("")}
							className="material-symbols-rounded p-1 bg-red-500 text-white rounded-md cursor-pointer hover:bg-red-600 h-fit !aspect-square"
						>
							close
						</button>
					</Tooltip>
				</div>

				<div className="">
					{filteredSeries?.map((series) => (
						<button
							onClick={() => handleClickSeries(series)}
							className="group w-full focus:outline-none bg-white border cursor-pointer focus:bg-slate-50 hover:bg-slate-50 first:border-t border-t-0 first:rounded-t-md last:rounded-b-md flex flex-row justify-between items-center space-x-2 border-slate-200 px-5 py-5"
						>
							<div>{series.title}</div>
							<div className="bg-slate-100 px-2 py-1 rounded-md group-hover:bg-slate-200 group-focus:bg-slate-200">
								{series.genre}
							</div>
						</button>
					))}
				</div>
			</div>
		</div>
	);
};

export default Search;
