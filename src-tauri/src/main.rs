// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use scraper::{Html, Selector};

mod windows;
use tauri::{AppHandle, State};
use windows::{create_main_window, cmd_create_search_window, cmd_create_series_window};

mod structs;
use structs::{Episode, Language, QueueEpisode, Season, Series};

mod constants;
use constants::{ALL_SERIES_URL, BASE_URL};

mod helpers;
use helpers::fetch;

mod queue;
use queue::{AsyncQueue, QueueState};


// Holt alle Serien.
#[tauri::command]
async fn cmd_get_all_series() -> Result<Vec<Series>, String> {
    
    let response = fetch(ALL_SERIES_URL).await.map_err(|e| format!("Fehler beim Abrufen der Daten: {:?}", e))?;

    let document = Html::parse_document(&response);
    
    let genre_selector = Selector::parse("#seriesContainer .genre").unwrap();
    let genre_title_selector = Selector::parse("h3").unwrap();
    let genre_series_selector = Selector::parse("ul li a").unwrap();

    // Holt alle Serien aus dem Dokument.
    // Holt zunächst alle Genres und dann die darunterliegenden Serien.
    // Titel, Url und Genre werden geschrieben. Seasons bleibt noch leer.
    let all_series: Vec<Series> = document
    .select(&genre_selector)
    .flat_map(|genre| {
        let genre_title = genre
            .select(&genre_title_selector)
            .next()
            .map_or_else(String::new, |el| el.inner_html());

        genre
            .select(&genre_series_selector)
            .filter_map(move |el| {
                let title = el.text().collect::<String>().trim().to_string();
                let url = el.value().attr("href").unwrap_or_default().to_string();

                (!title.is_empty()).then(|| Series {
                    title,
                    url,
                    genre: genre_title.clone(),
                    seasons: vec![],
                })
            })
    })
    .collect();

    println!("Serien gefunden: {}", all_series.len());

    Ok(all_series)
}

// Holt Serie mit allen Staffeln und Episoden anhand der Serien-Url.
#[tauri::command]
async fn cmd_get_series(url: String) -> Result<Series, String> {

    let mut series: Series = Series { title: String::from("Test"), url: String::from("Test"), genre:String::from("Test"), seasons: vec![] };

    let mut seasons_response = scrape_seasons(url).await.map_err(|e| format!("Fehler beim Abrufen der Daten: {:?}", e))?;

    for season in &mut seasons_response {
        let episodes_response = scrape_episodes(season.url.clone()).await.map_err(|e| format!("Fehler beim Abrufen der Daten: {:?}", e))?;
        season.episodes = episodes_response;
    }
    series.seasons = seasons_response;

    Ok(series)
}

// Holt alle Staffeln einer Serie anhand der Serien-Url.
async fn scrape_seasons(series_url: String) -> Result<Vec<Season>, String> {
    let url = format!("{}{}", BASE_URL, series_url);
    let response = fetch(&url).await.map_err(|e| format!("Fehler beim Abrufen der Daten: {:?}", e))?;

    let document = Html::parse_document(&response);
    let list_selector = Selector::parse(".hosterSiteDirectNav > ul").map_err(|_| "Fehler beim Parsen des Selectors")?;
    let ul = document.select(&list_selector).next().ok_or("Keine Staffeln gefunden.")?;

    let a_season = Selector::parse("li a").map_err(|_| "Fehler beim Parsen des Season-Selectors")?;
    let seasons: Vec<Season> = ul
        .select(&a_season)
        .filter_map(|a| {
            Some(Season {
                title: a.value().attr("title")?.to_string(),
                url: a.value().attr("href")?.to_string(),
                episodes: Vec::new(),
            })
        })
        .collect();

    if seasons.is_empty() {
        return Err("Keine Staffeln gefunden.".to_string());
    }

    Ok(seasons)
}

// Holt alle Episoden einer Staffel anhand der Staffel-Url.
async fn scrape_episodes(season_url: String) -> Result<Vec<Episode>, String> {
    let url = format!("{}{}", BASE_URL, season_url);
    let response = fetch(url.as_str()).await.map_err(|e| format!("Fehler beim Abrufen der Daten: {:?}", e))?;

    let document = Html::parse_document(&response);

    let tr_episodes_selector = Selector::parse(".seasonEpisodesList tbody tr").map_err(|_| "Fehler beim Parsen des Episode-Selectors")?;
    let td_a_selector = Selector::parse("td a").map_err(|_| "Fehler beim Parsen des Links")?;
    let strong_selector = Selector::parse("strong").map_err(|_| "Fehler beim Parsen des Titels")?;
    let span_selector = Selector::parse("span").map_err(|_| "Fehler beim Parsen des Alternativtitels")?;

    let episodes: Vec<Episode> = document
        .select(&tr_episodes_selector)
        .filter_map(|tr| {
            let index = tr.select(&td_a_selector).next()?.inner_html();
            let a_element = tr.select(&td_a_selector).nth(1)?;

            let title = a_element.select(&strong_selector).next().map(|s| s.inner_html()).unwrap_or_default();
            let altTitle = a_element.select(&span_selector).next().map(|s| s.inner_html()).unwrap_or_default();
            let url = a_element.value().attr("href")?.to_string();

            Some(Episode {
                title,
                altTitle,
                url,
                seasonName: String::new(),
                seriesName: String::new(),
                index,
            })
        })
        .collect();

    Ok(episodes)
}


#[tauri::command]
async fn add_episode_to_queue(
    state: State<'_, QueueState>,
    app_handle: AppHandle,
    queueEpisode: QueueEpisode
) -> Result<(), String> {
    state.0.enqueue(queueEpisode, app_handle).await;
    Ok(())
}






fn main() {

    let episode_queue = AsyncQueue::new();
    
    tauri::Builder::default()
        .setup(|app| {
            create_main_window(app);
            Ok(())
        })
        .manage(QueueState(episode_queue))
        .invoke_handler(tauri::generate_handler![cmd_create_search_window, cmd_create_series_window, cmd_get_all_series, cmd_get_series, add_episode_to_queue])
        .run(tauri::generate_context!())
        .expect("Fehler beim Starten der App.");
}
