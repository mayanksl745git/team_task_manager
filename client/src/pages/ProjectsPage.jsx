import { useEffect, useState } from 'react';

import { getProjects } from '../api/projects';
import { getUsers } from '../api/users';
import CreateProjectModal from '../components/CreateProjectModal';
import ProjectCard from '../components/ProjectCard';
import { useAuth } from '../context/AuthContext';

export default function ProjectsPage() {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError('');

      const projectsResponse = await getProjects();
      setProjects(projectsResponse.data);

      if (isAdmin()) {
        const usersResponse = await getUsers();
        setUsers(usersResponse.data);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Portfolio</p>
          <h2 className="mt-2 text-3xl font-bold text-white">Projects</h2>
          <p className="mt-2 text-sm text-slate-400">
            {isAdmin() ? 'Create, organize, and maintain every team project.' : 'View the projects you are part of.'}
          </p>
        </div>

        {isAdmin() && (
          <button type="button" onClick={() => setIsCreateModalOpen(true)} className="btn-primary">
            Create Project
          </button>
        )}
      </div>

      {loading && <div className="card-panel p-6 text-sm text-slate-300">Loading projects...</div>}
      {error && <div className="rounded-2xl bg-danger/10 p-6 text-sm text-danger">{error}</div>}

      {!loading && !error && (
        <>
          {projects.length === 0 ? (
            <div className="card-panel p-6 text-sm text-slate-400">No projects available yet.</div>
          ) : (
            <div className="grid gap-5 xl:grid-cols-2">
              {projects.map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          )}
        </>
      )}

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        users={users}
        onCreated={loadProjects}
      />
    </div>
  );
}
