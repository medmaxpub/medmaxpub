export default function SectionHeader({ label, title, description, align = "left" }) {
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";

  return (
    <div className={`max-w-3xl ${alignClass}`}>
      {label ? <span className="eyebrow">{label}</span> : null}
      <h2 className="font-display text-2xl font-semibold text-brand-ink sm:text-3xl lg:text-4xl">{title}</h2>
      {description ? <p className="mt-4 text-base leading-7 text-brand-slate sm:text-lg sm:leading-8">{description}</p> : null}
    </div>
  );
}
