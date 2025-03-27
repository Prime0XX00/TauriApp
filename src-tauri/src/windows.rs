use tauri::WebviewWindowBuilder;
use tauri::App;

use crate::structs::Series;

pub fn create_main_window(app: &App) {
    let _window = WebviewWindowBuilder::new(app, "main", tauri::WebviewUrl::App("".into()))
    .title("Queue")
    .inner_size(900.0, 600.0)
    .resizable(true)
    .build();
}

#[tauri::command]
pub async fn cmd_create_search_window(app: tauri::AppHandle) {
    let _window = WebviewWindowBuilder::new(&app, "search", tauri::WebviewUrl::App("search".into()))
    .title("Browser")
    .inner_size(900.0, 600.0)
    .resizable(true)
    .build();
}

#[tauri::command]
pub async fn cmd_create_series_window(app: tauri::AppHandle, series: Series) {

    let encoded_url = urlencoding::encode(&series.url);
    let window_url = format!("/series?url={}", encoded_url);

    let _window = WebviewWindowBuilder::new(&app, &series.url, tauri::WebviewUrl::App(window_url.into()))
    .title(series.title)
    .inner_size(900.0, 600.0)
    .resizable(true)
    .build();
}