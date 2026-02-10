import { useAppStore } from '../store/appStore';

export function getApiKeyForSource(source: string): string | null {
  const state = useAppStore.getState();
  switch (source) {
    case 'wallhaven':
      return state.wallhavenApiKey || null;
    case 'unsplash':
      return state.unsplashApiKey || null;
    case 'pixabay':
      return state.pixabayApiKey || null;
    case 'pexels':
      return state.pexelsApiKey || null;
    default:
      return null;
  }
}
