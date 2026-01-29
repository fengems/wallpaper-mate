import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import RandomWallpaper from './pages/RandomWallpaper';
import WallpaperList from './pages/WallpaperList';
import AutoSwitch from './pages/AutoSwitch';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<RandomWallpaper />} />
          <Route path="list" element={<WallpaperList />} />
          <Route path="auto-switch" element={<AutoSwitch />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
