export default function RouteLoadingScreen({
  title = "Loading page",
  description = "Please wait while the content is being prepared."
}) {
  return (
    <div className="container-shell flex min-h-[40vh] items-center justify-center py-12">
      <div className="card-panel w-full max-w-xl px-6 py-10 text-center">
        <div className="mx-auto h-10 w-10 animate-pulse rounded-full bg-brand-navy/15" />
        <h2 className="mt-5 text-xl font-semibold text-brand-ink">{title}</h2>
        <p className="mt-2 text-sm text-brand-slate">{description}</p>
      </div>
    </div>
  );
}
