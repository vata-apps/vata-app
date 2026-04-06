use image::ImageReader;

#[tauri::command]
async fn generate_thumbnail(
    source_path: String,
    dest_path: String,
    max_width: u32,
) -> Result<(), String> {
    let img = ImageReader::open(&source_path)
        .map_err(|e| format!("Failed to open image: {e}"))?
        .decode()
        .map_err(|e| format!("Failed to decode image: {e}"))?;

    let thumbnail = img.thumbnail(max_width, u32::MAX);
    thumbnail
        .save(&dest_path)
        .map_err(|e| format!("Failed to save thumbnail: {e}"))?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::default().build());

    #[cfg(debug_assertions)]
    {
        builder = builder.plugin(tauri_plugin_mcp_bridge::init());
    }

    builder
        .invoke_handler(tauri::generate_handler![generate_thumbnail])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
