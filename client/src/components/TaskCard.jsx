import { format, isPast } from 'date-fns';

import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';

export default function TaskCard({ task, onStatusChange, canEditStatus = false, compact = false }) {
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'done';

  return (
    <div className={`card-panel p-5 ${isOverdue ? 'border-danger/60' : ''}`}>
      <div className={`flex ${compact ? 'flex-col gap-4' : 'flex-col gap-5 lg:flex-row lg:items-start lg:justify-between'}`}>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-white">{task.title}</h3>
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
          </div>

          <p className="text-sm text-slate-400">{task.description || 'No task description provided.'}</p>

          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
            <span>Project: {task.project?.name || 'Unknown project'}</span>
            <span>Assigned: {task.assignedTo?.name || 'Unassigned'}</span>
            <span className={isOverdue ? 'font-semibold text-danger' : ''}>
              Due: {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy p') : 'No deadline'}
            </span>
          </div>
        </div>

        {canEditStatus && (
          <div className="w-full lg:w-48">
            <label className="label-text">Update Status</label>
            <select
              className="input-field"
              value={task.status}
              onChange={(event) => onStatusChange?.(task, event.target.value)}
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
