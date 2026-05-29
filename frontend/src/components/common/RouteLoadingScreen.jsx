export default function RouteLoadingScreen({ label = "Loading content" }) {
  return (
    <div className="container-shell flex min-h-[32vh] items-center justify-center py-10" role="status" aria-label={label}>
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-navy/15 border-t-brand-crimson" />
    </div>
  );
}
