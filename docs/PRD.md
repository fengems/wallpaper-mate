# Wallpaper Mate - Product Requirements Document (PRD)

## 1. Project Overview

**Project Name:** Wallpaper Mate

**Description:** A beautiful wallpaper manager for macOS built with Tauri. Automatically fetches, generates, and sets stunning wallpapers with a native-like experience.

**Target Platform:** macOS (primary), with future Windows support via Tauri cross-platform capabilities.

**Core Value:** Provide a lightweight, native-feeling wallpaper management application that automatically keeps the desktop fresh with beautiful images.

---

## 2. Technical Solution

### 2.1 Technology Stack Selection

#### Decision Matrix: Swift vs Tauri

| Factor | Swift (Native) | Tauri (Rust + Web) | Selection |
|--------|----------------|-------------------|-----------|
| **Native Experience** | ⭐⭐⭐⭐⭐ Best | ⭐⭐⭐⭐ Very Good | Swift wins |
| **App Size** | ⭐⭐⭐⭐⭐ Smallest | ⭐⭐⭐⭐ Small (3-10MB) | Swift wins |
| **Vibe Coding / AI-friendly** | ⭐⭐⭐ Moderate | ⭐⭐⭐⭐⭐ Excellent | **Tauri wins** |
| **Cross-platform** | ❌ macOS only | ✅ macOS + Windows + Linux | **Tauri wins** |
| **Development Speed** | ⭐⭐⭐ Moderate | ⭐⭐⭐⭐ Fast | Tauri wins |
| **Ecosystem** | Apple-only | Massive Rust + Web ecosystem | Tauri wins |
| **Wallpaper API Access** | Native NSWorkspace | `wallpaper` crate (mature) | Both easy |

#### Final Decision: **Tauri**

**Key Reasons:**
1. **Vibe Coding** - Frontend frameworks (React/Vue/Svelte) are more familiar to AI models, easier maintenance
2. **Cross-platform** - Future Windows compatibility without rewriting codebase
3. **Small Footprint** - Significantly smaller than Electron (3-10MB vs 100MB+)
4. **Wallpaper API** - The `wallpaper` crate provides simple cross-platform wallpaper management
5. **Mature Ecosystem** - Rust backend + Modern web frontend

### 2.2 Tech Stack Details

**Backend (Rust):**
- Tauri 2.0 (latest stable)
- `wallpaper` crate (v3.2+) for system wallpaper management
- `tokio` for async operations
- `reqwest` for HTTP requests (wallpaper fetching)
- `serde` for serialization

**Frontend (Web):**
- **Framework:** React (with Vite) - Recommended for AI code generation
- **UI Library:** shadcn/ui or similar for modern, accessible components
- **State Management:** Zustand or React Context API
- **Styling:** TailwindCSS for rapid development

**System Integration:**
- **Menu Bar:** Tauri System Tray API (native macOS menu bar)
- **Notifications:** macOS native notifications
- **File System:** Persistent storage for wallpaper cache

---

## 3. Feature Requirements

### 3.1 Priority Matrix

| Feature | Priority | Complexity | Target Release |
|---------|----------|------------|----------------|
| Wallpaper Fetching | **P0** | Medium | v1.0 |
| Automatic Wallpaper Replacement | **P0** | Medium | v1.0 |
| Menu Bar App | **P0** | Low | v1.0 |
| AI Wallpaper Generation | **P1** | High | v2.0 |
| Windows Support | **P2** | Medium | Future |
| Advanced Scheduling | **P1** | Low | v1.5 |

### 3.2 Detailed Features

#### Phase 1: MVP (v1.0)

**1. Wallpaper Fetching (P0)**
- Support popular wallpaper sources:
  - Unsplash API (free, high quality)
  - Wallhaven (popular anime/art wallpapers)
  - Bing Daily Wallpaper API
  - Custom URL support
- Download and cache wallpapers locally
- Filter by resolution, category, tags
- Preview wallpapers before setting

**2. Automatic Wallpaper Replacement (P0)**
- Manual: One-click wallpaper change
- Timer: Set intervals (e.g., every 30 min, 1 hour, daily)
- Trigger: On startup, on wake from sleep
- Support for multiple monitors

**3. Menu Bar App (P0)**
- System tray icon in macOS menu bar
- Quick actions:
  - Next wallpaper
  - Pause/resume auto-change
  - Open settings
  - View current wallpaper info
- Status indicator (e.g., auto-change active/paused)

**4. Settings Management (P0)**
- Wallpaper source selection
- Change frequency configuration
- Resolution preferences
- Cache management
- App launch on startup

**5. Wallpaper History (P1)**
- Keep history of last N wallpapers
- One-click revert to previous wallpaper
- Mark wallpapers as favorites

#### Phase 2: Enhanced Experience (v1.5)

**6. Advanced Scheduling (P1)**
- Set specific wallpapers for specific times (e.g., morning, evening)
- Day/night automatic switching
- Custom schedules (Monday = nature wallpapers, etc.)

**7. Wallpaper Collections (P1)**
- Create custom collections (e.g., "Nature", "Abstract", "Minimalist")
- Batch download wallpapers to collections
- Shuffle within collections

#### Phase 3: AI Generation (v2.0)

**8. AI Wallpaper Generation (P1)**
- Integration with AI image APIs:
  - Stable Diffusion API (Replicate, local SD)
  - DALL-E API (OpenAI)
  - Midjourney API (if available)
- Prompt-based generation
- Style presets (photorealistic, anime, abstract, etc.)
- Negative prompt support
- Aspect ratio control

**9. Smart Curation (P2)**
- Learn user preferences (based on favorites/skips)
- AI-powered wallpaper recommendations
- Mood-based suggestions (optional: integrate with calendar/weather)

#### Phase 4: Cross-platform (Future)

**10. Windows Support (P2)**
- Tauri cross-platform support
- Windows system tray
- Windows-native notifications
- Maintain feature parity

---

## 4. User Stories

### MVP Stories

**As a user, I want to:**
1. Fetch wallpapers from popular sources, so I have a variety of beautiful images.
2. Set a wallpaper as my desktop background with one click.
3. Automatically change wallpapers on a schedule, so my desktop feels fresh.
4. Access the app quickly from the menu bar, so I can change wallpapers without opening a full window.
5. Configure wallpaper preferences (resolution, category, frequency), so the app matches my style.
6. See a preview before setting a wallpaper, so I know what I'm getting.

### Future Stories

7. Generate custom wallpapers using AI, so I can have unique images.
8. Create collections of my favorite wallpapers, so I can organize them by theme.
9. Use the app on Windows, so I can have the same experience across devices.

---

## 5. Non-Functional Requirements

### Performance
- App startup time < 2 seconds
- Wallpaper fetch time < 5 seconds (for cached)
- Wallpaper download time < 30 seconds (depending on image size)
- Memory usage < 100MB (idle)

### Reliability
- Graceful handling of network failures
- Auto-retry for failed downloads
- Persistent cache (survives app restart)
- No data loss on app crash

### Usability
- Native macOS feel and keyboard shortcuts
- Intuitive UI with clear feedback
- Accessible design (WCAG AA compliance)
- Responsive on all screen sizes (if window app)

### Security
- Secure API key storage (Keychain integration)
- No data sent to third parties without consent
- Code signing for macOS distribution

### Maintainability
- Clean, modular code architecture
- Comprehensive error handling
- Well-documented APIs
- AI-friendly code structure

---

## 6. Technical Architecture

### 6.1 High-Level Architecture

```
┌─────────────────────────────────────────┐
│         Frontend (React + Vite)        │
│  - UI Components                        │
│  - State Management                     │
│  - Menu Bar Integration                │
└──────────────┬──────────────────────────┘
               │ Tauri IPC
               ▼
┌─────────────────────────────────────────┐
│      Backend (Rust + Tauri)            │
│  - Wallpaper Commands                   │
│  - API Handlers                        │
│  - Scheduler Service                   │
│  - Cache Management                    │
└──────────────┬──────────────────────────┘
               │
               ├─► wallpaper crate (System API)
               ├─► reqwest (HTTP Client)
               ├─► tokio (Async Runtime)
               └─► File System (Cache)
```

### 6.2 Key Modules

**Frontend Modules:**
- `components/` - React UI components
- `hooks/` - Custom React hooks (e.g., useWallpaper)
- `services/` - API service layer (calls Tauri commands)
- `store/` - State management
- `types/` - TypeScript type definitions

**Backend Modules:**
- `commands/` - Tauri command handlers
- `services/` - Business logic (fetcher, scheduler, cache)
- `sources/` - Wallpaper source implementations (Unsplash, Wallhaven, etc.)
- `utils/` - Helper functions

---

## 7. Development Roadmap

### Q1 2026: Foundation
- [x] Project setup and architecture design
- [ ] Tauri 2.0 project initialization
- [ ] Basic menu bar app structure
- [ ] Wallpaper API integration (`wallpaper` crate)
- [ ] First wallpaper source (Unsplash)

### Q2 2026: MVP
- [ ] Complete wallpaper fetching features
- [ ] Implement auto-change timer
- [ ] Settings UI and persistence
- [ ] Testing and bug fixes
- [ ] v1.0 release

### Q3 2026: Enhanced
- [ ] Advanced scheduling
- [ ] Wallpaper history and favorites
- [ ] Additional wallpaper sources
- [ ] Performance optimization
- [ ] v1.5 release

### Q4 2026: AI Integration
- [ ] AI API integration (Stable Diffusion/DALL-E)
- [ ] Prompt-based generation UI
- [ ] Style presets
- [ ] v2.0 release

### 2027: Expansion
- [ ] Windows support
- [ ] Smart curation (ML-based)
- [ ] Community features (sharing, collections)

---

## 8. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| API rate limits from wallpaper sources | High | Implement caching, multiple source support, respect rate limits |
| `wallpaper` crate compatibility issues | Medium | Test thoroughly on target OS, contribute fixes upstream |
| Tauri 2.0 breaking changes | Medium | Pin to stable version, monitor release notes |
| AI API cost and reliability | High | Support multiple providers, implement fallbacks, allow local AI (SD) |
| macOS app store approval | Medium | Follow Apple guidelines, code signing, privacy policy |

---

## 9. Success Metrics

**Product Success:**
- 1000+ downloads in first month
- 4.5+ star rating on Mac App Store (if published)
- 70%+ retention rate after 30 days

**Technical Success:**
- < 2% crash rate
- < 5% API error rate
- 50MB app size target

**User Engagement:**
- Average of 3+ wallpaper changes per week per user
- 20%+ users use favorites feature
- 10%+ users enable AI generation (after feature launch)

---

## 10. Open Questions

1. **Frontend Framework:** React vs Vue vs Svelte? (Recommend React for AI code generation)
2. **UI Library:** shadcn/ui vs Chakra UI vs Mantine? (Recommend shadcn/ui for modern, accessible components)
3. **AI Integration:** Which AI provider to prioritize? (Stable Diffusion for flexibility, DALL-E for ease)
4. **Monetization:** Free vs Paid vs Freemium? (Recommend Freemium: free basic features, paid AI generation)

---

## 11. References

- [Tauri Documentation](https://tauri.app/)
- [`wallpaper` crate](https://docs.rs/wallpaper/)
- [Unsplash API](https://unsplash.com/developers)
- [Wallhaven API](https://wallhaven.cc/help/api)
- [Bing Daily Wallpaper API](https://www.microsoft.com/en-us/bing/apis/bing-image-search-api)
- [shadcn/ui](https://ui.shadcn.com/)

---

**Document Version:** 1.0
**Last Updated:** January 28, 2026
**Status:** Draft
