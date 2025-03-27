use regex::Regex;

pub async fn fetch(url: &str) -> Result<String, Box<dyn std::error::Error>> {

    println!("Seite '{}' wird aufgerufen...", url);

    let response = reqwest::get(url)
    .await
    .map_err(|e| format!("Fehler beim Abrufen der URL: {}", e))?
    .text()
    .await
    .map_err(|e| format!("Fehler beim Lesen der Antwort: {}", e))?;

    Ok(response)
}

pub fn sanitize_filename(filename: &str) -> String {
    let forbidden_chars = Regex::new(r#"['&`<>:"/\\|?*!;,\s.]"#).unwrap();
    forbidden_chars.replace_all(filename, "").to_string()
}