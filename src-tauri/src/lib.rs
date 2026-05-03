use image::ImageReader;
use tauri::menu::{AboutMetadata, Menu, MenuItem, PredefinedMenuItem, Submenu};
use tauri::{AppHandle, Emitter, Runtime};

const CLOSE_TREE_MENU_ID: &str = "close-tree";
const CLOSE_TREE_MENU_EVENT: &str = "menu:close-tree";

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

fn build_app_menu<R: Runtime>(app: &AppHandle<R>) -> tauri::Result<Menu<R>> {
    let pkg_info = app.package_info();
    let config = app.config();
    let about_metadata = AboutMetadata {
        name: Some(pkg_info.name.clone()),
        version: Some(pkg_info.version.to_string()),
        copyright: config.bundle.copyright.clone(),
        authors: config.bundle.publisher.clone().map(|p| vec![p]),
        ..Default::default()
    };

    let close_tree = MenuItem::with_id(
        app,
        CLOSE_TREE_MENU_ID,
        "Close Tree",
        true,
        Some("CmdOrCtrl+W"),
    )?;

    Menu::with_items(
        app,
        &[
            #[cfg(target_os = "macos")]
            &Submenu::with_items(
                app,
                &pkg_info.name,
                true,
                &[
                    &PredefinedMenuItem::about(app, None, Some(about_metadata.clone()))?,
                    &PredefinedMenuItem::separator(app)?,
                    &PredefinedMenuItem::services(app, None)?,
                    &PredefinedMenuItem::separator(app)?,
                    &PredefinedMenuItem::hide(app, None)?,
                    &PredefinedMenuItem::hide_others(app, None)?,
                    &PredefinedMenuItem::show_all(app, None)?,
                    &PredefinedMenuItem::separator(app)?,
                    &PredefinedMenuItem::quit(app, None)?,
                ],
            )?,
            &Submenu::with_items(
                app,
                "File",
                true,
                &[
                    &close_tree,
                    #[cfg(not(target_os = "macos"))]
                    &PredefinedMenuItem::quit(app, None)?,
                ],
            )?,
            &Submenu::with_items(
                app,
                "Edit",
                true,
                &[
                    &PredefinedMenuItem::undo(app, None)?,
                    &PredefinedMenuItem::redo(app, None)?,
                    &PredefinedMenuItem::separator(app)?,
                    &PredefinedMenuItem::cut(app, None)?,
                    &PredefinedMenuItem::copy(app, None)?,
                    &PredefinedMenuItem::paste(app, None)?,
                    &PredefinedMenuItem::select_all(app, None)?,
                ],
            )?,
            #[cfg(target_os = "macos")]
            &Submenu::with_items(
                app,
                "View",
                true,
                &[&PredefinedMenuItem::fullscreen(app, None)?],
            )?,
            &Submenu::with_items(
                app,
                "Window",
                true,
                &[
                    &PredefinedMenuItem::minimize(app, None)?,
                    &PredefinedMenuItem::maximize(app, None)?,
                ],
            )?,
            &Submenu::with_items(
                app,
                "Help",
                true,
                &[
                    #[cfg(not(target_os = "macos"))]
                    &PredefinedMenuItem::about(app, None, Some(about_metadata))?,
                ],
            )?,
        ],
    )
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .menu(build_app_menu)
        .on_menu_event(|app, event| {
            if event.id().as_ref() == CLOSE_TREE_MENU_ID {
                if let Err(err) = app.emit(CLOSE_TREE_MENU_EVENT, ()) {
                    eprintln!("Failed to emit {CLOSE_TREE_MENU_EVENT}: {err}");
                }
            }
        });

    #[cfg(debug_assertions)]
    {
        builder = builder.plugin(tauri_plugin_mcp_bridge::init());
    }

    builder
        .invoke_handler(tauri::generate_handler![generate_thumbnail])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
