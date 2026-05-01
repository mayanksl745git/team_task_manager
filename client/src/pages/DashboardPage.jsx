import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getProjects } from '../api/projects';
import { getDashboard } from '../api/tasks';
import { getUsers } from '../api/users';
import CreateTaskModal from '../components/CreateTaskModal';
import StatCard from '../components/StatCard';
import TaskCard from '../components/TaskCard';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const dashboardResponse = await getDashboard();
      setDashboard(dashboardResponse.data);

      if (isAdmin()) {
        const [projectsResponse, usersResponse] = await Promise.all([getProjects(), getUsers()]);
        setProjects(projectsResponse.data);
        setUsers(usersResponse.data);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <div className="card-panel p-6 text-sm text-slate-300">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="rounded-2xl bg-danger/10 p-6 text-sm text-danger">{error}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Overview</p>
          <h2 className="mt-2 text-3xl font-bold text-white">Dashboard</h2>
        </div>

        <div className="flex flex-wrap gap-3">
          {isAdmin() && (
            <button type="button" onClick={() => setIsTaskModalOpen(true)} className="btn-primary">
              Create Task
            </button>
          )}
          <button type="button" onClick={() => navigate('/projects')} className="btn-secondary">
            View Projects
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Tasks" value={dashboard.total} accent="brand" />
        <StatCard label="To Do" value={dashboard.todo} accent="warning" />
        <StatCard label="In Progress" value={dashboard.inProgress} accent="brand" />
        <StatCard label="Done" value={dashboard.done} accent="success" />
        <StatCard label="Overdue" value={dashboard.overdue} accent="danger" highlight />
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">My Tasks</h3>
          <button type="button" onClick={() => navigate('/tasks')} className="text-sm font-medium text-indigo-300">
            View all tasks
          </button>
        </div>

        {dashboard.myTasks.length === 0 ? (
          <div className="card-panel p-6 text-sm text-slate-400">No assigned tasks yet.</div>
        ) : (
          <div className="grid gap-4">
            {dashboard.myTasks.map((task) => (
              <TaskCard key={task._id} task={task} />
            ))}
          </div>
        )}
      </section>

      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onCreated={loadData}
        projects={projects}
        users={users}
      />
    </div>
  );
}
