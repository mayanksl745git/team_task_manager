export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 px-4 py-8">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 shadow-soft">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 transition hover:text-white">
            Close
          </button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}
