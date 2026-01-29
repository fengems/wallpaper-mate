import React from 'react';
import { NavLink } from 'react-router-dom';
import { Dices, LayoutGrid } from 'lucide-react';

  const Sidebar: React.FC = () => {
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center justify-center p-4 my-2 rounded-lg transition-all duration-200 ease-in-out
    ${isActive ? 'bg-zinc-700/50 text-white shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`;

  return (
    <aside className="w-16 h-screen bg-zinc-950/80 backdrop-blur-xl border-r border-zinc-800/50 flex flex-col items-center py-4">
      <nav className="flex flex-col space-y-4">
        <NavLink to="/" className={navLinkClasses}>
          <Dices size={24} />
        </NavLink>
        <NavLink to="/list" className={navLinkClasses}>
          <LayoutGrid size={24} />
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
