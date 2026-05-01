export default function StatCard({ label, value, accent = 'brand', highlight = false }) {
  const accentMap = {
    brand: 'from-brand/20 to-brand/5 text-indigo-200',
    success: 'from-success/20 to-success/5 text-green-200',
    warning: 'from-warning/20 to-warning/5 text-amber-200',
    danger: 'from-danger/20 to-danger/5 text-red-200',
  };

  return (
    <div className={`card-panel p-5 ${highlight ? 'ring-1 ring-danger/40' : ''}`}>
      <div className={`rounded-2xl bg-gradient-to-br p-4 ${accentMap[accent] || accentMap.brand}`}>
        <p className="text-sm font-medium text-slate-300">{label}</p>
        <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}
