import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function ProjectCard({ project }) {
  const members = project.members || [];
  const avatars = members.slice(0, 4);

  return (
    <Link to={`/projects/${project._id}`} className="card-panel block p-6 transition hover:-translate-y-1 hover:border-slate-700">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{project.name}</h3>
          <p className="mt-2 text-sm text-slate-400">{project.description || 'No project description provided.'}</p>
        </div>
        <span className="rounded-full bg-brand/15 px-3 py-1 text-xs font-semibold text-indigo-200">
          {project.taskCount} tasks
        </span>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <div className="flex -space-x-3">
          {avatars.map((member) => (
            <div
              key={member._id}
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-900 bg-slate-700 text-sm font-semibold text-white"
              title={member.name}
            >
              {member.name.slice(0, 1).toUpperCase()}
            </div>
          ))}
        </div>
        <p className="text-sm text-slate-400">{members.length} team members</p>
      </div>

      <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
        <span>Owner: {project.owner?.name}</span>
        <span>{format(new Date(project.createdAt), 'MMM d, yyyy')}</span>
      </div>
    </Link>
  );
}
