const priorityStyles = {
  low: 'bg-slate-700 text-slate-100',
  medium: 'bg-brand/20 text-indigo-300',
  high: 'bg-danger/20 text-danger',
};

export default function PriorityBadge({ priority }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${priorityStyles[priority]}`}>
      {priority}
    </span>
  );
}
