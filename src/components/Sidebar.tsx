import { NavLink } from 'react-router-dom';
import { Dices, LayoutGrid, Clock, Heart, Download } from 'lucide-react';

export default function Sidebar() {
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center justify-center p-3 my-1 rounded-lg transition-all duration-200 ease-in-out
    ${isActive ? 'bg-zinc-700/50 text-white shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`;

  return (
    <aside className="w-16 h-screen bg-zinc-950/80 backdrop-blur-xl border-r border-zinc-800/50 flex flex-col items-center py-4">
      <nav className="flex flex-col space-y-2">
        <NavLink to="/" className={navLinkClasses}>
          <Dices size={22} />
        </NavLink>
        <NavLink to="/list" className={navLinkClasses}>
          <LayoutGrid size={22} />
        </NavLink>
        <NavLink to="/favorites" className={navLinkClasses}>
          <Heart size={22} />
        </NavLink>
        <NavLink to="/downloads" className={navLinkClasses}>
          <Download size={22} />
        </NavLink>
        <NavLink to="/auto-switch" className={navLinkClasses}>
          <Clock size={22} />
        </NavLink>
      </nav>
    </aside>
  );
}
