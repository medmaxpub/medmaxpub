export default function SectionHeader({
  label,
  title,
  description,
  align = "left",
  className = "",
  titleClassName = "",
  descriptionClassName = ""
}) {
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";
  const wrapperClassName = ["max-w-3xl", alignClass, className].filter(Boolean).join(" ");
  const titleClasses = ["font-display text-2xl font-semibold text-brand-ink sm:text-3xl lg:text-4xl", titleClassName]
    .filter(Boolean)
    .join(" ");
  const descriptionClasses = ["mt-4 text-base leading-7 text-brand-slate sm:text-lg sm:leading-8", descriptionClassName]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapperClassName}>
      {label ? <span className="eyebrow">{label}</span> : null}
      {title ? <h2 className={titleClasses}>{title}</h2> : null}
      {description ? <p className={descriptionClasses}>{description}</p> : null}
    </div>
  );
}
