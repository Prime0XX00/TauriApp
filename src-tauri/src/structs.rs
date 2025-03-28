use serde::{Deserialize, Serialize};


#[derive(Clone, Serialize, Debug, Deserialize)]
pub struct Series {
    pub title: String,
    pub url: String,
    pub genre: String,
    pub seasons: Vec<Season>,
}

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct Season {
    pub title: String,
    pub url: String,
    pub episodes: Vec<Episode>,
}

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct Episode {
    pub index: String,
    pub title: String,
    pub altTitle: String,
    pub url: String,
    pub seasonName: String,
    pub seriesName: String,
}

#[derive(Clone, Serialize, Debug, Deserialize)]
pub struct Provider {
    pub title: String,
    pub url: String,
}

#[derive(Clone, Serialize, Debug, Deserialize)]
pub struct Language {
    pub languageId: String,
    pub title: String,
    pub url: String,
}

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct Progress {
    pub currentTime: String,
    pub percentage: i64,
}

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct QueueEpisode {
    pub index: usize,
    pub state: QueueEpisodeState,
    pub episode: Episode,
    pub language: Language,
    pub progress: Progress,
}

#[derive(Clone, Serialize, Deserialize, Debug, PartialEq)]
pub enum QueueEpisodeState {
    Waiting,
    Fetching,
    Downloading,
    Paused,
    Success,
    Failed,
}

