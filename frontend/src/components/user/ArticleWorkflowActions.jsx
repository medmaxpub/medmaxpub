function getStatusClasses(tone) {
  if (tone === "current") {
    return "border-cyan-400/40 bg-cyan-400/10 text-cyan-100";
  }

  if (tone === "archived") {
    return "border-amber-400/40 bg-amber-400/10 text-amber-100";
  }

  return "border-violet-400/40 bg-violet-400/10 text-violet-100";
}

function getActionClasses(variant) {
  if (variant === "danger") {
    return "border-rose-500/30 bg-rose-500/10 text-rose-100 hover:border-rose-400 hover:bg-rose-500/20";
  }

  if (variant === "muted") {
    return "border-brand-border bg-brand-surface text-brand-slate hover:border-brand-teal hover:text-brand-ink";
  }

  return "border-brand-teal/40 bg-brand-sky text-brand-ink hover:border-brand-teal hover:bg-brand-elevated";
}

export default function ArticleWorkflowActions({ statusLabel, statusTone = "in-press", actions = [] }) {
  return (
    <div className="flex flex-col gap-3">
      {statusLabel ? (
        <span
          className={`inline-flex w-fit rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${getStatusClasses(statusTone)}`}
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
              className={`inline-flex items-center rounded-full border px-3 py-2 text-xs font-semibold transition ${getActionClasses(action.variant)}`}
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
