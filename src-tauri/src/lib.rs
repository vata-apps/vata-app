use image::ImageReader;
use tauri::menu::{AboutMetadata, Menu, MenuItem, PredefinedMenuItem, Submenu};
use tauri::{AppHandle, Emitter, Manager, Runtime, State};

const CLOSE_TREE_MENU_ID: &str = "close-tree";
const CLOSE_TREE_MENU_EVENT: &str = "menu:close-tree";

struct CloseTreeMenuItem(MenuItem<tauri::Wry>);

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

// Mirrors `tauri::menu::Menu::default` with File > "Close Window" replaced by
// "Close Tree" and Window > "Close Window" removed. Re-sync on Tauri upgrades.
fn build_app_menu<R: Runtime>(app: &AppHandle<R>) -> tauri::Result<(Menu<R>, MenuItem<R>)> {
    let pkg_info = app.package_info();
    let config = app.config();
    let about_metadata = AboutMetadata {
        name: Some(pkg_info.name.clone()),
        version: Some(pkg_info.version.to_string()),
        copyright: config.bundle.copyright.clone(),
        authors: config.bundle.publisher.clone().map(|p| vec![p]),
        ..Default::default()
    };

    // Disabled by default; the React tree shell route enables it on mount and
    // disables it on unmount via `set_close_tree_enabled`.
    let close_tree = MenuItem::with_id(
        app,
        CLOSE_TREE_MENU_ID,
        "Close Tree",
        false,
        Some("CmdOrCtrl+W"),
    )?;

    let menu = Menu::with_items(
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
            #[cfg(not(target_os = "macos"))]
            &Submenu::with_items(
                app,
                "Help",
                true,
                &[&PredefinedMenuItem::about(app, None, Some(about_metadata))?],
            )?,
        ],
    )?;

    Ok((menu, close_tree))
}

#[tauri::command]
fn set_close_tree_enabled(
    state: State<'_, CloseTreeMenuItem>,
    enabled: bool,
) -> Result<(), String> {
    state.0.set_enabled(enabled).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .menu(|app| {
            let (menu, close_tree) = build_app_menu(app)?;
            app.manage(CloseTreeMenuItem(close_tree));
            Ok(menu)
        })
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
        .invoke_handler(tauri::generate_handler![
            generate_thumbnail,
            set_close_tree_enabled
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
