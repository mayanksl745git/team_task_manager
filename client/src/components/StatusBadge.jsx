const statusStyles = {
  todo: 'bg-slate-700 text-slate-100',
  'in-progress': 'bg-warning/20 text-warning',
  done: 'bg-success/20 text-success',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[status]}`}>
      {status.replace('-', ' ')}
    </span>
  );
}
