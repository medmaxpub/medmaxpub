function getStatusClasses(tone) {
  if (tone === "current") {
    return "border-cyan-200 bg-cyan-50 text-cyan-700";
  }

  if (tone === "archived") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-violet-200 bg-violet-50 text-violet-700";
}

function getActionClasses(variant) {
  if (variant === "danger") {
    return "border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300 hover:bg-rose-100";
  }

  if (variant === "muted") {
    return "border-brand-border bg-white text-brand-slate hover:border-brand-teal hover:bg-brand-sky hover:text-brand-ink";
  }

  return "border-brand-navy/20 bg-blue-50 text-brand-ink hover:border-brand-navy/40 hover:bg-blue-100";
}

export default function ArticleWorkflowActions({ statusLabel, statusTone = "in-press", actions = [] }) {
  return (
    <div className="flex flex-col gap-3">
      {statusLabel ? (
        <span
          className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] ${getStatusClasses(statusTone)}`}
        >
          {statusLabel}
        </span>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.label}
              type="button"
              className={`inline-flex min-h-10 items-center rounded-full border px-3 py-2 text-xs font-semibold transition ${getActionClasses(
                action.variant
              )}`}
              onClick={action.onClick}
            >
              {Icon ? <Icon size={13} className="mr-2" /> : null}
              {action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
