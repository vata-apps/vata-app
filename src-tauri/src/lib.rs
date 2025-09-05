use std::fs;
use serde::{Deserialize, Serialize};
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize)]
pub struct TreeInfo {
    name: String,
    path: String,
    created_at: String,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn create_tree(app_handle: tauri::AppHandle, name: String) -> Result<TreeInfo, String> {
    // Get app data directory and create trees subdirectory
    let app_data_dir = app_handle.path().app_data_dir().map_err(|e| format!("Failed to get app data directory: {}", e))?;
    let trees_dir = app_data_dir.join("trees");
    
    if !trees_dir.exists() {
        fs::create_dir_all(&trees_dir).map_err(|e| format!("Failed to create trees directory: {}", e))?;
    }
    
    // Create database file path
    let db_path = trees_dir.join(format!("{}.db", name));
    let db_path_str = db_path.to_string_lossy().to_string();
    
    // Check if tree already exists
    if db_path.exists() {
        return Err(format!("Tree '{}' already exists", name));
    }
    
    // For now, we'll create an empty file - later we'll initialize with schema
    fs::File::create(&db_path).map_err(|e| format!("Failed to create database file: {}", e))?;
    
    Ok(TreeInfo {
        name: name.clone(),
        path: db_path_str,
        created_at: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs()
            .to_string(),
    })
}

#[tauri::command]
async fn list_trees(app_handle: tauri::AppHandle) -> Result<Vec<TreeInfo>, String> {
    let app_data_dir = app_handle.path().app_data_dir().map_err(|e| format!("Failed to get app data directory: {}", e))?;
    let trees_dir = app_data_dir.join("trees");
    
    if !trees_dir.exists() {
        return Ok(vec![]);
    }
    
    let mut trees = Vec::new();
    let entries = fs::read_dir(&trees_dir).map_err(|e| format!("Failed to read trees directory: {}", e))?;
    
    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read directory entry: {}", e))?;
        let path = entry.path();
        
        if path.extension().and_then(|s| s.to_str()) == Some("db") {
            if let Some(name) = path.file_stem().and_then(|s| s.to_str()) {
                let metadata = entry.metadata().map_err(|e| format!("Failed to read file metadata: {}", e))?;
                let created_at = metadata.created()
                    .ok()
                    .and_then(|time| time.duration_since(std::time::UNIX_EPOCH).ok())
                    .map(|duration| duration.as_secs().to_string())
                    .unwrap_or_else(|| "unknown".to_string());
                
                trees.push(TreeInfo {
                    name: name.to_string(),
                    path: path.to_string_lossy().to_string(),
                    created_at,
                });
            }
        }
    }
    
    Ok(trees)
}

#[tauri::command]
async fn delete_tree(app_handle: tauri::AppHandle, name: String) -> Result<(), String> {
    let app_data_dir = app_handle.path().app_data_dir().map_err(|e| format!("Failed to get app data directory: {}", e))?;
    let db_path = app_data_dir.join("trees").join(format!("{}.db", name));
    
    if !db_path.exists() {
        return Err(format!("Tree '{}' does not exist", name));
    }
    
    fs::remove_file(&db_path).map_err(|e| format!("Failed to delete tree: {}", e))?;
    
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .invoke_handler(tauri::generate_handler![greet, create_tree, list_trees, delete_tree])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
