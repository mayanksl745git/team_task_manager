import { Navigate, Outlet, Route, Routes } from 'react-router-dom';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AdminRoute from './components/AdminRoute';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ProjectsPage from './pages/ProjectsPage';
import RegisterPage from './pages/RegisterPage';
import TasksPage from './pages/TasksPage';
import TeamPage from './pages/TeamPage';

function AppShell() {
  return (
    <div className="min-h-screen bg-background text-slate-100">
      <Sidebar />
      <div className="md:pl-72">
        <Navbar />
        <main className="min-h-[calc(100vh-80px)] px-4 pb-24 pt-6 sm:px-6 lg:px-8 md:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function RootRedirect() {
  const { token } = useAuth();
  return <Navigate to={token ? '/dashboard' : '/auth/login'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route
          path="/team"
          element={
            <AdminRoute>
              <TeamPage />
            </AdminRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
