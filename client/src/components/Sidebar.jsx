import { NavLink } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

const baseLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/projects', label: 'Projects' },
  { to: '/tasks', label: 'Tasks' },
];

export default function Sidebar() {
  const { isAdmin } = useAuth();
  const links = isAdmin() ? [...baseLinks, { to: '/team', label: 'Team' }] : baseLinks;

  return (
    <>
      <aside className="fixed left-0 top-0 hidden h-screen w-72 flex-col border-r border-slate-800 bg-slate-950 px-6 py-8 md:flex">
        <div className="mb-10">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-lg font-bold text-white">
            TT
          </div>
          <h2 className="text-xl font-bold text-white">Team Task Manager</h2>
          <p className="mt-2 text-sm text-slate-400">Manage projects, assign work, and track delivery.</p>
        </div>

        <nav className="space-y-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive ? 'bg-brand text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-800 bg-slate-950/95 px-3 py-3 backdrop-blur md:hidden">
        <div className={`grid gap-2 ${links.length === 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-2xl px-3 py-2 text-center text-xs font-semibold ${
                  isActive ? 'bg-brand text-white' : 'bg-slate-900 text-slate-300'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
