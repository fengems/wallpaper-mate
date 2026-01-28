pub mod commands;
pub mod services;
pub mod sources;
pub mod types;
pub mod utils;

use types::WallpaperError;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      #[cfg(target_os = "macos")]
      {
          use tauri::{menu::{Menu, MenuItem, Submenu}, tray::TrayIconBuilder};

          let fetch_menu = MenuItem::new("fetch_wallpaper", "下一张壁纸", true, None::<String>)
              .expect("Failed to create menu item");
          let open_settings = MenuItem::new("open_settings", "设置...", true, None::<String>)
              .expect("Failed to create menu item");
          let quit_menu = MenuItem::new("quit", "退出", true, None::<String>)
              .expect("Failed to create menu item");

          let tray_menu = Menu::with_items(app, &[&fetch_menu, &quit_menu])
              .expect("Failed to create menu");

          let _tray = TrayIconBuilder::with_id("main-tray")
              .menu(&tray_menu)
              .icon(tauri::Icon::Raw(include_bytes!("../icons/16x16.png")))
              .on_menu_event(move |app, event| {
                  if event.id == "fetch_wallpaper" {
                      let _ = app.emit("fetch-wallpaper", ());
                  } else if event.id == "open_settings" {
                      let _ = app.emit("open-settings", ());
                  } else if event.id == "quit" {
                      std::process::exit(0);
                  }
              })
              .build(app)
              .expect("Failed to create tray");
      }

      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
        commands::wallpaper::fetch_next_wallpaper,
        commands::wallpaper::set_wallpaper_from_info,
        commands::wallpaper::get_current_wallpaper_path,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        assert_eq!(2 + 2, 4);
    }
}

