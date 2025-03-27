export interface ISeries {
	title: String;
	genre: String;
	seasons: ISeason[];
}

export interface ISeason {
	title: String;
	url: String;
	episodes: IEpisode[];
}

export interface IEpisode {
	index: String;
	title: String;
	alt_title: String;
	url: String;
	seasonName: String;
	seriesName: String;
}

export interface ILanguage {
	languageId: String;
	title: String;
	url: String;
}

export interface IQueueEpisode {
	episode: IEpisode;
	language: ILanguage;
	progress: IProgress;
}

export interface IProgress {
	currentTime: string;
	percentage: number;
}
