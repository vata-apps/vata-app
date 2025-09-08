// Simplified approach - let's use what works and add minimal menu items
use tauri::Emitter;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .on_menu_event(|app, event| {
            // Handle menu events
            match event.id().0.as_str() {
                "preferences" => {
                    let _ = app.emit_to("main", "menu", "preferences");
                }
                "about" => {
                    let _ = app.emit_to("main", "menu", "about");
                }
                "new" => {
                    let _ = app.emit_to("main", "menu", "new");
                }
                "open" => {
                    let _ = app.emit_to("main", "menu", "open");
                }
                "save" => {
                    let _ = app.emit_to("main", "menu", "save");
                }
                "save_as" => {
                    let _ = app.emit_to("main", "menu", "save_as");
                }
                _ => {}
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
