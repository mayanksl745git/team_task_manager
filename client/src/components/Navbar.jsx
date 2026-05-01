import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-background/90 backdrop-blur">
      <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Team Task Manager</p>
          <h1 className="text-lg font-semibold text-white">Stay aligned across projects and tasks</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden rounded-2xl border border-slate-800 bg-slate-800/80 px-4 py-2 text-right sm:block">
            <p className="text-sm font-semibold text-white">{user?.name}</p>
            <p className="text-xs uppercase tracking-wide text-slate-400">{user?.role}</p>
          </div>
          <button type="button" onClick={handleLogout} className="btn-secondary">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
