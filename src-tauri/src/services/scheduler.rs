use std::sync::{Arc, RwLock};
use std::collections::HashMap;
use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AutoSwitchConfig {
    pub enabled: bool,
    pub interval_seconds: u64,
}

impl Default for AutoSwitchConfig {
    fn default() -> Self {
        Self {
            enabled: false,
            interval_seconds: 3600,
        }
    }
}

type AutoSwitchState = Arc<RwLock<HashMap<String, AutoSwitchConfig>>>;

pub struct WallpaperScheduler {
    state: AutoSwitchState,
}

impl WallpaperScheduler {
    pub fn new() -> Self {
        Self {
            state: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub fn set_config(&self, source: &str, config: AutoSwitchConfig) {
        let key = format!("scheduler_{}", source);
        let mut state = self.state.write().unwrap();
        state.insert(key, config);
    }

    pub fn get_config(&self, source: &str) -> Option<AutoSwitchConfig> {
        let key = format!("scheduler_{}", source);
        let state = self.state.read().unwrap();
        state.get(&key).cloned()
    }
}

static SCHEDULER: std::sync::OnceLock<WallpaperScheduler> = std::sync::OnceLock::new();

pub fn get_scheduler() -> &'static WallpaperScheduler {
    SCHEDULER.get_or_init(|| WallpaperScheduler::new())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_config() {
        let config = AutoSwitchConfig::default();
        assert_eq!(config.enabled, false);
        assert_eq!(config.interval_seconds, 3600);
    }
}
