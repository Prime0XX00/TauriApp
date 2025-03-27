use std::process::{exit, Command, Stdio};
use std::error::Error;
use std::env;
use std::path::Path;
use regex::Regex;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};
use tokio::process::Command as TokioCommand;
use tokio::io::{AsyncBufReadExt, BufReader as AsyncBufReader};

#[derive(Clone, Serialize, Deserialize, Debug)]
struct Progress {
    current_time: String,
    progress: f64,
}

pub async fn download_and_convert_video(m3u8_url: String, output_file: String, app_handle: AppHandle) -> Result<(), String> {

    let result = env::current_exe();
    if result.is_err() {
        return Err("Fehler pfad".to_string());
    }
    let exe_path = result.unwrap_or_default();
    
    let ffmpeg_path = exe_path
        .parent()
        .ok_or("Fehler beim Bestimmen des Pfads zur ausführbaren Datei")?
        .join("assets/ffmpeg/ffmpeg.exe");

    if !ffmpeg_path.exists() {
        eprintln!("FFmpeg wurde nicht gefunden: {}", ffmpeg_path.display());
        return Err("FFmpeg wurde nicht gefunden!".into());
    }
    
    let mut child = TokioCommand::new(ffmpeg_path)
        .arg("-i")               // Eingabedatei
        .arg(m3u8_url.clone())   // Die URL der M3U8-Datei
        .arg("-c:v")             // Video-Codec
        .arg("libx264")          // H.264 Codec für MP4
        .arg("-preset")          // Voreinstellung (optional)
        .arg("fast")             // Schnelle Kodierung (optional)
        .arg("-c:a")             // Audio-Codec
        .arg("aac")              // AAC Audio-Codec
        .arg("-strict")          // Erforderlich, um den `aac`-Codec zu verwenden
        .arg("-2")               // AAC in Version 2
        .arg(output_file)        // Die Ausgabedatei
        .stdout(Stdio::null())   
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Fehler beim Starten von FFmpeg: {}", e))?;     


    let stderr = child.stderr.take().ok_or("Konnte stderr nicht abrufen")?;
    let mut reader = AsyncBufReader::new(stderr).lines();

    let mut total_duration: f64 = 0.0;

    while let Ok(Some(line)) = reader.next_line().await {
        if line.contains("Duration:") {  
            if let Some(duration) = extract_duration(&line) {
                total_duration = duration;

            }
        }

        if line.contains("time=") {   
            if let Some((current_time, progress)) = extract_progress(&line, total_duration) {
                let _ = app_handle.emit("ffmpeg_progress", Progress {current_time: current_time, progress: progress});
            }
        }
    }


    let status = child.wait().await.map_err(|e| format!("Fehler beim Warten auf FFmpeg: {}", e))?;
    
    if status.success() {
        let _ = app_handle.emit("ffmpeg_success", "FFmpeg hat erfolgreich abgeschlossen!");
    } else {
        let _ = app_handle.emit("ffmpeg_fail", format!("FFmpeg fehlgeschlagen mit Code: {:?}", status.code()));
    }

    Ok(())
}

fn extract_progress(line: &str, total_duration: f64) -> Option<(String, f64)> {
    if let Some(time_str) = line.split_whitespace().find(|s| s.starts_with("time=")) {
        let time_str = time_str.replace("time=", "");
        let current_time = parse_time(&time_str);

        if total_duration > 0.0 {
            let progress = (current_time / total_duration) * 100.0;
            return Some((time_str, progress));
        }
    }
    None
}

fn extract_duration(line: &str) -> Option<f64> {
    let re = Regex::new(r"Duration:\s(\d+):(\d+):([\d.]+)").unwrap();
    if let Some(captures) = re.captures(line) {
        let hours: f64 = captures.get(1)?.as_str().parse().ok()?;
        let minutes: f64 = captures.get(2)?.as_str().parse().ok()?;
        let seconds: f64 = captures.get(3)?.as_str().parse().ok()?;
        return Some(hours * 3600.0 + minutes * 60.0 + seconds);
    }
    None
}

fn parse_time(time_str: &str) -> f64 {
    let parts: Vec<&str> = time_str.split(':').collect();
    if parts.len() == 3 {
        let hours: f64 = parts[0].parse().unwrap_or(0.0);
        let minutes: f64 = parts[1].parse().unwrap_or(0.0);
        let seconds: f64 = parts[2].parse().unwrap_or(0.0);
        return hours * 3600.0 + minutes * 60.0 + seconds;
    }
    0.0
}