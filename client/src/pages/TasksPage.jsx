import { isPast } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';

import { getProjects } from '../api/projects';
import { deleteTask, getTasks, updateTask } from '../api/tasks';
import { getUsers } from '../api/users';
import CreateTaskModal from '../components/CreateTaskModal';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

export default function TasksPage() {
  const { isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    projectId: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError('');

      const [tasksResponse, projectsResponse] = await Promise.all([getTasks(filters), getProjects()]);
      setTasks(tasksResponse.data);
      setProjects(projectsResponse.data);

      if (isAdmin()) {
        const usersResponse = await getUsers();
        setUsers(usersResponse.data);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [filters.status, filters.priority, filters.projectId]);

  const projectLookup = useMemo(
    () =>
      projects.reduce((accumulator, project) => {
        accumulator[project._id] = project.name;
        return accumulator;
      }, {}),
    [projects]
  );

  const handleStatusChange = async (taskId, status) => {
    try {
      await updateTask(taskId, { status });
      await loadTasks();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to update task status');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      setError('');
      await deleteTask(taskId);
      await loadTasks();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to delete task');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Execution</p>
          <h2 className="mt-2 text-3xl font-bold text-white">Tasks</h2>
          <p className="mt-2 text-sm text-slate-400">
            Filter work by project, priority, and status. Members can update their task progress inline.
          </p>
        </div>

        {isAdmin() && (
          <button type="button" onClick={() => setIsTaskModalOpen(true)} className="btn-primary">
            Create Task
          </button>
        )}
      </div>

      <div className="card-panel p-5">
        <div className="grid gap-4 lg:grid-cols-3">
          <select
            className="input-field"
            value={filters.status}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
          >
            <option value="">All statuses</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>

          <select
            className="input-field"
            value={filters.priority}
            onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value }))}
          >
            <option value="">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <select
            className="input-field"
            value={filters.projectId}
            onChange={(event) => setFilters((current) => ({ ...current, projectId: event.target.value }))}
          >
            <option value="">All projects</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && <div className="card-panel p-6 text-sm text-slate-300">Loading tasks...</div>}
      {error && <div className="rounded-2xl bg-danger/10 p-6 text-sm text-danger">{error}</div>}

      {!loading && !error && (
        <>
          <div className="grid gap-4 md:hidden">
            {tasks.length === 0 ? (
              <div className="card-panel p-6 text-sm text-slate-400">No tasks match the current filters.</div>
            ) : (
              tasks.map((task) => (
                <div key={task._id} className={`card-panel p-5 ${task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'done' ? 'border-danger/60' : ''}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-white">{task.title}</h3>
                      <p className="mt-1 text-sm text-slate-400">{task.project?.name || projectLookup[task.project]}</p>
                    </div>
                    <PriorityBadge priority={task.priority} />
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <StatusBadge status={task.status} />
                    <select
                      className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                      value={task.status}
                      onChange={(event) => handleStatusChange(task._id, event.target.value)}
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </div>

                  {isAdmin() && (
                    <button type="button" onClick={() => handleDeleteTask(task._id)} className="btn-danger mt-4 w-full">
                      Delete Task
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="hidden overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800">
                <thead className="bg-slate-950/70">
                  <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-6 py-4">Task</th>
                    <th className="px-6 py-4">Project</th>
                    <th className="px-6 py-4">Assignee</th>
                    <th className="px-6 py-4">Priority</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
                  {tasks.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                        No tasks match the current filters.
                      </td>
                    </tr>
                  ) : (
                    tasks.map((task) => {
                      const overdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'done';

                      return (
                        <tr key={task._id} className={overdue ? 'bg-danger/5' : ''}>
                          <td className="px-6 py-4">
                            <p className="font-semibold text-white">{task.title}</p>
                            <p className="mt-1 text-xs text-slate-500">{task.description || 'No description'}</p>
                          </td>
                          <td className="px-6 py-4">{task.project?.name || projectLookup[task.project]}</td>
                          <td className="px-6 py-4">{task.assignedTo?.name || 'Unassigned'}</td>
                          <td className="px-6 py-4">
                            <PriorityBadge priority={task.priority} />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-2">
                              <StatusBadge status={task.status} />
                              <select
                                className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                                value={task.status}
                                onChange={(event) => handleStatusChange(task._id, event.target.value)}
                              >
                                <option value="todo">To Do</option>
                                <option value="in-progress">In Progress</option>
                                <option value="done">Done</option>
                              </select>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {isAdmin() ? (
                              <button type="button" onClick={() => handleDeleteTask(task._id)} className="btn-danger">
                                Delete
                              </button>
                            ) : (
                              <span className="text-xs text-slate-500">Status only</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onCreated={loadTasks}
        projects={projects}
        users={users}
      />
    </div>
  );
}
