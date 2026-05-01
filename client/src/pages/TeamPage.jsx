import { useEffect, useMemo, useState } from 'react';

import { getProjects } from '../api/projects';
import { getUsers } from '../api/users';

export default function TeamPage() {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTeamData = async () => {
      try {
        setLoading(true);
        setError('');

        const [usersResponse, projectsResponse] = await Promise.all([getUsers(), getProjects()]);
        setUsers(usersResponse.data);
        setProjects(projectsResponse.data);
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Failed to fetch team data');
      } finally {
        setLoading(false);
      }
    };

    loadTeamData();
  }, []);

  const projectCountByUser = useMemo(() => {
    return users.reduce((accumulator, user) => {
      const count = projects.filter(
        (project) => project.owner?._id === user._id || project.members.some((member) => member._id === user._id)
      ).length;

      accumulator[user._id] = count;
      return accumulator;
    }, {});
  }, [projects, users]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">People</p>
        <h2 className="mt-2 text-3xl font-bold text-white">Team Members</h2>
        <p className="mt-2 text-sm text-slate-400">Review user roles and see how many projects each teammate is involved in.</p>
      </div>

      {loading && <div className="card-panel p-6 text-sm text-slate-300">Loading team members...</div>}
      {error && <div className="rounded-2xl bg-danger/10 p-6 text-sm text-danger">{error}</div>}

      {!loading && !error && (
        <>
          {users.length === 0 ? (
            <div className="card-panel p-6 text-sm text-slate-400">No team members found yet.</div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {users.map((user) => (
                <div key={user._id} className="card-panel p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                      <p className="mt-1 text-sm text-slate-400">{user.email}</p>
                    </div>
                    <span className="rounded-full bg-brand/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-200">
                      {user.role}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-slate-900 p-4">
                      <p className="text-sm text-slate-400">Projects</p>
                      <p className="mt-2 text-2xl font-bold text-white">{projectCountByUser[user._id] || 0}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-900 p-4">
                      <p className="text-sm text-slate-400">Role</p>
                      <p className="mt-2 text-2xl font-bold capitalize text-white">{user.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
