pub mod commands;
pub mod services;
pub mod sources;
pub mod types;

pub use sources::bing;
pub use sources::wallhaven;
pub use sources::unsplash;
pub use sources::pixabay;

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
          use tauri::{menu::{Menu, MenuItem}, tray::TrayIconBuilder, Emitter};
          use tauri::image::Image;

          let fetch_menu = MenuItem::with_id(app, "fetch_wallpaper", "下一张壁纸", true, None::<String>)
              .expect("Failed to create menu item");
          let open_settings = MenuItem::with_id(app, "open_settings", "设置...", true, None::<String>)
              .expect("Failed to create menu item");
          let quit_menu = MenuItem::with_id(app, "quit", "退出", true, None::<String>)
              .expect("Failed to create menu item");

          let tray_menu = Menu::with_items(app, &[&fetch_menu, &open_settings, &quit_menu])
              .expect("Failed to create menu");

          let icon_bytes = include_bytes!("../icons/16x16.png");
          let icon = Image::new_owned(icon_bytes.to_vec(), 16, 16);

          let _tray = TrayIconBuilder::with_id("main-tray")
              .menu(&tray_menu)
              .icon(icon)
              .on_menu_event(|app: &tauri::AppHandle, event: tauri::menu::MenuEvent| {
                  if event.id.as_ref() == "fetch_wallpaper" {
                      let _ = app.emit("fetch-wallpaper", ());
                  } else if event.id.as_ref() == "open_settings" {
                      let _ = app.emit("open-settings", ());
                  } else if event.id.as_ref() == "quit" {
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
        commands::wallpaper::fetch_wallpapers_list,
        commands::wallpaper::download_wallpaper,
        commands::wallpaper::set_auto_switch_config,
        commands::wallpaper::get_auto_switch_config,
        commands::wallpaper::list_downloads,
        commands::wallpaper::delete_download,
        commands::wallpaper::reveal_in_finder,
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

