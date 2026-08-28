import { Download, ExternalLink, Mail } from "lucide-react";

function formatDateTime(value) {
  if (!value) {
    return "NA";
  }

  try {
    return new Date(value).toLocaleString();
  } catch {
    return "NA";
  }
}

function truncateWords(text, limit = 10) {
  const value = String(text || "").trim();
  if (!value) return "";
  const words = value.split(/\s+/);
  if (words.length <= limit) return value;
  return `${words.slice(0, limit).join(" ")}...`;
}

function SubmissionCell({ label, children, className = "" }) {
  return (
    <td className={`align-top px-3 py-2.5 text-sm text-brand-slate ${className}`}>
      <div className="min-w-0 space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-teal md:hidden">{label}</p>
        {children}
      </div>
    </td>
  );
}

export default function SubmissionInbox({ submissions = [], isLoading = false, emptyMessage = "No manuscript submissions yet." }) {
  if (isLoading) {
    return null;
  }

  if (!submissions.length) {
    return (
      <div className="rounded-3xl border border-brand-border bg-brand-elevated p-6 text-brand-slate">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="card-panel overflow-hidden">
      <div className="border-b border-brand-border bg-brand-elevated px-5 py-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-teal">Online Submission</p>
        <h2 className="mt-1.5 font-display text-xl font-semibold text-brand-ink">Submission Inbox</h2>
        <p className="mt-1.5 text-sm leading-6 text-brand-slate">Review incoming manuscript submissions in a row-wise table with all core author and article details.</p>
      </div>

      <div className="responsive-table-shell">
        <table className="responsive-table responsive-table-wide">
          <thead>
            <tr className="bg-white">
              <th className="border-b border-brand-border px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">Name</th>
              <th className="border-b border-brand-border px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">Email ID</th>
              <th className="border-b border-brand-border px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">Address</th>
              <th className="border-b border-brand-border px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">Country</th>
              <th className="border-b border-brand-border px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">Journal</th>
              <th className="border-b border-brand-border px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">Article Type</th>
              <th className="border-b border-brand-border px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">Article Title</th>
              <th className="border-b border-brand-border px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">Abstract</th>
              <th className="border-b border-brand-border px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">Files</th>
            </tr>
          </thead>

          <tbody>
            {submissions.map((item, index) => (
              <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-brand-sky/35"}>
                <SubmissionCell label="Name" className="min-w-[150px]">
                  <div>
                    <p className="font-semibold text-brand-ink">{item.name || "NA"}</p>
                    <p className="text-xs text-brand-slate">Submitted {formatDateTime(item.createdAt)}</p>
                  </div>
                </SubmissionCell>

                <SubmissionCell label="Email ID" className="min-w-[190px]">
                  {item.email ? (
                    <a href={`mailto:${item.email}`} className="inline-flex items-center gap-2 transition hover:text-brand-ink">
                      <Mail size={15} className="text-brand-gold" />
                      <span className="break-all">{item.email}</span>
                    </a>
                  ) : (
                    <span>NA</span>
                  )}
                </SubmissionCell>

                <SubmissionCell label="Address" className="min-w-[180px]">
                  <p className="line-clamp-2 leading-5">{item.postalAddress || "NA"}</p>
                </SubmissionCell>

                <SubmissionCell label="Country" className="min-w-[110px]">
                  <p>{item.country || "NA"}</p>
                </SubmissionCell>

                <SubmissionCell label="Journal" className="min-w-[190px]">
                  <div className="space-y-1">
                    <p className="line-clamp-2 font-semibold text-brand-ink" title={item.journalTitle || ""}>
                      {item.journalTitle || "Journal unavailable"}
                    </p>
                    {item.journalUrl ? (
                      <a href={`/journals/${item.journalUrl}/home`} className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-navy transition hover:text-brand-ink">
                        <ExternalLink size={14} />
                        Open Journal
                      </a>
                    ) : null}
                  </div>
                </SubmissionCell>

                <SubmissionCell label="Article Type" className="min-w-[140px]">
                  <p className="line-clamp-2">{item.articleType || "NA"}</p>
                </SubmissionCell>

                <SubmissionCell label="Article Title" className="min-w-[180px]">
                  <p className="line-clamp-2 font-medium text-brand-ink" title={item.manuscriptTitle || ""}>
                    {item.manuscriptTitle || "NA"}
                  </p>
                </SubmissionCell>

                <SubmissionCell label="Abstract" className="min-w-[180px]">
                  <p className="line-clamp-2 max-w-[180px] text-xs leading-4 text-brand-slate" title={item.abstract || ""}>
                    {item.abstract ? truncateWords(item.abstract, 10) : "NA"}
                  </p>
                </SubmissionCell>

                <SubmissionCell label="Files" className="min-w-[100px]">
                  <div className="flex flex-wrap gap-1.5">
                    {(item.files || []).length ? (
                      item.files.map((file) => (
                        <a
                          key={file.id}
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          download
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-brand-border bg-white text-brand-crimson transition hover:border-brand-teal hover:bg-brand-sky"
                          aria-label={`Download ${file.name || "attachment"}`}
                          title="Download attachment"
                        >
                          <Download size={15} strokeWidth={2.4} className="shrink-0" />
                        </a>
                      ))
                    ) : (
                      <span>NA</span>
                    )}
                  </div>
                </SubmissionCell>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}