
use std::sync::Arc;
use tauri::{AppHandle, Emitter};
use tokio::{sync::{mpsc, Mutex}, task};
use std::collections::VecDeque;
use tokio::time::{sleep, Duration};

use crate::{structs::{Progress, QueueEpisodeState}, QueueEpisode};

pub struct AsyncQueue {
    items: Arc<Mutex<VecDeque<QueueEpisode>>>,
    is_processing: Arc<Mutex<bool>>,
    sender: mpsc::Sender<()>,
    receiver: Arc<Mutex<mpsc::Receiver<()>>>,
}

pub struct QueueState(pub AsyncQueue);


impl AsyncQueue {
 
    pub fn new() -> Self {
        let (sender, receiver) = mpsc::channel(100);
        
        AsyncQueue {
            items: Arc::new(Mutex::new(VecDeque::new())),
            is_processing: Arc::new(Mutex::new(false)),
            sender,
            receiver: Arc::new(Mutex::new(receiver)),
        }
    }

    pub async fn enqueue(&self, mut item: QueueEpisode, app_handle: tauri::AppHandle) {
        
        {
            let mut items = self.items.lock().await;
            item.index = items.len();
            items.push_back(item);
        } 

        self.notify_frontend(app_handle.clone()).await;
        
        self.start_processing(app_handle.clone()).await;
    }

    async fn start_processing(&self, app_handle: tauri::AppHandle) {
        let start_processing = {
            let mut is_processing = self.is_processing.lock().await;
            if *is_processing {
                false
            } else {
                *is_processing = true;
                true
            }
        };
    
        if !start_processing {
            return;
        }
    
        let items_clone = self.items.clone();
        let is_processing_clone = self.is_processing.clone();
        let sender_clone = self.sender.clone();
    
        task::spawn(async move {
            let mut index = 0;
    
            loop {
                let item_option = {
                    let mut items = items_clone.lock().await;
                    items.pop_front()
                };
    
                if let Some(item) = item_option {
                    
                    println!("{:?} {:?}", item.state, QueueEpisodeState::Waiting);
                    if item.state != QueueEpisodeState::Waiting {
                        index += 1;
                        continue;
                    }
                    
                    process_episode(item, app_handle.clone()).await;
                    let _ = sender_clone.send(()).await;
                    index += 1;
                } else {
                    let mut is_processing = is_processing_clone.lock().await;
                    *is_processing = false;
                    break;
                }   
            }
        });
    }
    
    pub async fn wait_for_one(&self) {
        let mut receiver = self.receiver.lock().await;
        let _ = receiver.recv().await;
    }
    
    pub async fn is_empty(&self) -> bool {
        let items = self.items.lock().await;
        items.is_empty()
    }
    
    pub async fn is_processing(&self) -> bool {
        let is_processing = self.is_processing.lock().await;
        *is_processing
    }

    pub async fn get_all_episodes(&self) -> Vec<QueueEpisode> {
        let items = self.items.lock().await;
        items.iter().cloned().collect()
    }

    async fn notify_frontend(&self, app_handle: AppHandle) {
        let items = self.get_all_episodes().await;
        let _ = app_handle.emit("queue_updated", items);
      
    }
}

async fn process_episode(mut item: QueueEpisode, app_handle: tauri::AppHandle) -> Result<String, String> {

    let episode_update = format!("episode_updated_{}", item.index);

    //let item2 = &item.clone();
    //let result = addDownload(item, app_handle).await;
    println!("Starte: {}", &item.episode.title);
    sleep(Duration::from_millis(1000)).await;

    item.state = QueueEpisodeState::Downloading;
    let _ = app_handle.emit(episode_update.as_str(), &item);
    sleep(Duration::from_millis(1000)).await;

    item.progress = Progress {currentTime: String::from(""), percentage: 20};
    let _ = app_handle.emit(episode_update.as_str(), &item);
    sleep(Duration::from_millis(1000)).await;

    item.progress = Progress {currentTime: String::from(""), percentage: 60};
    let _ = app_handle.emit(episode_update.as_str(), &item);
    sleep(Duration::from_millis(1000)).await;

    item.progress = Progress {currentTime: String::from(""), percentage: 100};
    let _ = app_handle.emit(episode_update.as_str(), &item);
    sleep(Duration::from_millis(1000)).await;

    println!("Erfolgreich: {}", &item.episode.title);

    item.state = QueueEpisodeState::Success;
    let _ = app_handle.emit(episode_update.as_str(), &item);

    //if result.is_ok() {
    //    println!("Erfolgreich: {}", &item2.episode.title)
    //}
    //else {
    //    println!("Fehler: {}", &item2.episode.title)
    //}


    Ok("()".to_string())
}