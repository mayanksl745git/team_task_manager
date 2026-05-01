import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { addMember, getProject, removeMember } from '../api/projects';
import { getTasks, updateTask } from '../api/tasks';
import { getUsers } from '../api/users';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskCard from '../components/TaskCard';
import { useAuth } from '../context/AuthContext';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');

  const loadProjectData = async () => {
    try {
      setLoading(true);
      setError('');

      const [projectResponse, tasksResponse] = await Promise.all([getProject(id), getTasks({ projectId: id })]);
      setProject(projectResponse.data);
      setTasks(tasksResponse.data);

      if (isAdmin()) {
        const usersResponse = await getUsers();
        setUsers(usersResponse.data);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [id]);

  const availableUsers = useMemo(() => {
    if (!project) {
      return [];
    }

    const memberIds = new Set(project.members.map((member) => member._id));
    memberIds.add(project.owner?._id);

    return users.filter((user) => !memberIds.has(user._id));
  }, [project, users]);

  const handleAddMember = async () => {
    try {
      setActionError('');
      await addMember(id, { userId: selectedUserId });
      setSelectedUserId('');
      await loadProjectData();
    } catch (requestError) {
      setActionError(requestError.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      setActionError('');
      await removeMember(id, userId);
      await loadProjectData();
    } catch (requestError) {
      setActionError(requestError.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleStatusChange = async (task, status) => {
    try {
      setActionError('');
      await updateTask(task._id, { status });
      await loadProjectData();
    } catch (requestError) {
      setActionError(requestError.response?.data?.message || 'Failed to update task status');
    }
  };

  if (loading) {
    return <div className="card-panel p-6 text-sm text-slate-300">Loading project details...</div>;
  }

  if (error) {
    return <div className="rounded-2xl bg-danger/10 p-6 text-sm text-danger">{error}</div>;
  }

  return (
    <div className="space-y-8">
      <section className="card-panel p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Project Detail</p>
            <h2 className="mt-2 text-3xl font-bold text-white">{project.name}</h2>
            <p className="mt-3 max-w-3xl text-sm text-slate-400">{project.description || 'No description available.'}</p>
          </div>

          {isAdmin() && (
            <button type="button" onClick={() => setIsTaskModalOpen(true)} className="btn-primary">
              Create Task
            </button>
          )}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-900 p-4">
            <p className="text-sm text-slate-400">Owner</p>
            <p className="mt-2 font-semibold text-white">{project.owner?.name}</p>
          </div>
          <div className="rounded-2xl bg-slate-900 p-4">
            <p className="text-sm text-slate-400">Members</p>
            <p className="mt-2 font-semibold text-white">{project.members.length}</p>
          </div>
          <div className="rounded-2xl bg-slate-900 p-4">
            <p className="text-sm text-slate-400">Tasks</p>
            <p className="mt-2 font-semibold text-white">{project.taskCount}</p>
          </div>
        </div>
      </section>

      <section className="card-panel p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Members</h3>
          <span className="text-sm text-slate-400">{project.members.length} active members</span>
        </div>

        <div className="mt-5 grid gap-3">
          {project.members.length === 0 ? (
            <p className="text-sm text-slate-400">No members added yet.</p>
          ) : (
            project.members.map((member) => (
              <div
                key={member._id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-white">{member.name}</p>
                  <p className="text-sm text-slate-400">{member.email}</p>
                </div>

                {isAdmin() && (
                  <button type="button" onClick={() => handleRemoveMember(member._id)} className="btn-secondary">
                    Remove
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {isAdmin() && (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-sm font-medium text-slate-300">Add a new member to this project</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <select
                className="input-field"
                value={selectedUserId}
                onChange={(event) => setSelectedUserId(event.target.value)}
              >
                <option value="">Select a user</option>
                {availableUsers.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
              <button type="button" disabled={!selectedUserId} onClick={handleAddMember} className="btn-primary">
                Add Member
              </button>
            </div>
          </div>
        )}

        {actionError && <p className="mt-4 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{actionError}</p>}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Project Tasks</h3>
          <span className="text-sm text-slate-400">{tasks.length} tasks found</span>
        </div>

        {tasks.length === 0 ? (
          <div className="card-panel p-6 text-sm text-slate-400">No tasks found for this project yet.</div>
        ) : (
          <div className="grid gap-4">
            {tasks.map((task) => (
              <TaskCard key={task._id} task={task} onStatusChange={handleStatusChange} canEditStatus />
            ))}
          </div>
        )}
      </section>

      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onCreated={loadProjectData}
        projects={project ? [project] : []}
        users={users}
        initialProjectId={project?._id}
      />
    </div>
  );
}
