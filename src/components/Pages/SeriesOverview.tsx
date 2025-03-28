import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import {
	EpisodeState,
	IEpisode,
	ILanguage,
	ISeason,
	ISeries,
} from "../../types";

const languages: ILanguage[] = [
	{
		languageId: "1",
		title: "GER DUB",
		url: "",
	},
	{
		languageId: "2",
		title: "ENG SUB",
		url: "",
	},
	{
		languageId: "3",
		title: "GER SUB",
		url: "",
	},
];

const SeriesOverview = () => {
	const params = new URLSearchParams(location.search);
	const series_url = decodeURIComponent(params.get("url") || "");

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const [series, setSeries] = useState<ISeries>();

	const [selectedLanguageIndex, setSelectedLanguageIndex] = useState(0);

	const fetchData = async () => {
		setError("");
		setLoading(true);

		await new Promise((resolve) => setTimeout(resolve, 1000));

		try {
			let result: ISeries = await invoke("cmd_get_series", {
				url: series_url,
			});

			result.seasons = result.seasons.map((season) => {
				season.episodes = season.episodes.map((episode) => {
					episode.seasonName = season.title;
					episode.seriesName = series?.title || "_Ungültig";
					return episode;
				});
				return season;
			});

			setSeries(result);
		} catch (error) {
			setError(`Daten konnte nicht geladen werden. ${error}`);
		} finally {
			setLoading(false);
		}
	};

	const handleEpisodeDownload = async (episode: IEpisode) => {
		const result = await invoke("add_episode_to_queue", {
			queueEpisode: {
				index: 0,
				state: EpisodeState.Waiting.valueOf(),
				episode: episode,
				language: languages[selectedLanguageIndex],
				progress: { currentTime: "", percentage: 0 },
			},
		});
	};

	const handleSeasonDownload = async (season: ISeason) => {
		const result = await invoke("add_season_to_queue", {
			season: season,
			language: languages[selectedLanguageIndex],
			progress: { currentTime: "", percentage: 0 },
		});
	};

	useEffect(() => {
		fetchData();
	}, []);

	return (
		<div className="relative bg-slate-50 overflow-y-auto w-full">
			<div className="absolute top-2 right-2 flex justify-end space-x-2">
				{languages.map((lang, index) => (
					<div
						onClick={() => setSelectedLanguageIndex(index)}
						className={`${
							selectedLanguageIndex === index
								? "text-amber-600"
								: ""
						}`}
					>
						{lang.title}
					</div>
				))}
			</div>
			<div className="mx-auto w-full p-10">
				{!error && !loading && (
					<div className="space-y-5">
						{series?.seasons.map((season) => (
							<div className="bg-white border rounded-md flex flex-col border-slate-200">
								<p
									className="px-5 py-5 font-semibold"
									onClick={() => handleSeasonDownload(season)}
								>
									{season.title}
								</p>
								<div>
									{season?.episodes.map((episode) => (
										<div
											className="px-5 cursor-pointer border-t last:rounded-b-md border-gray-300 py-1 hover:bg-slate-50"
											onClick={() =>
												handleEpisodeDownload(episode)
											}
										>
											{episode.title || episode.alt_title}
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default SeriesOverview;
