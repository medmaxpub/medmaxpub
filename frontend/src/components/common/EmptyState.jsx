export default function EmptyState({ title, description }) {
  return (
    <div className="card-panel flex min-h-40 items-center justify-center px-6 py-10 text-center">
      <div>
        <h3 className="text-lg font-semibold text-brand-navy">{title}</h3>
        <p className="mt-2 max-w-lg text-sm text-slate-600">{description}</p>
      </div>
    </div>
  );
}

