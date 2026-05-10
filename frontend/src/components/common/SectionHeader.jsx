export default function SectionHeader({ label, title, description, align = "left" }) {
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";

  return (
    <div className={`max-w-3xl ${alignClass}`}>
      {label ? <span className="eyebrow">{label}</span> : null}
      <h2 className="font-display text-3xl font-semibold text-brand-navy sm:text-4xl">{title}</h2>
      {description ? <p className="mt-4 text-lg leading-8 text-slate-600">{description}</p> : null}
    </div>
  );
}

