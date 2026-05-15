import { ExternalLink, FileText, Mail, MapPin } from "lucide-react";

export default function SubmissionInbox({ submissions = [], isLoading = false, emptyMessage = "No manuscript submissions yet." }) {
  if (isLoading) {
    return (
      <div className="rounded-3xl border border-brand-border bg-brand-elevated p-6 text-brand-slate">
        Loading manuscript submissions...
      </div>
    );
  }

  if (!submissions.length) {
    return (
      <div className="rounded-3xl border border-brand-border bg-brand-elevated p-6 text-brand-slate">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {submissions.map((item) => (
        <article key={item.id} className="rounded-3xl border border-brand-border bg-brand-surface p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-brand-teal">Online Submission</p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-brand-ink">{item.manuscriptTitle}</h2>
              <p className="mt-2 text-sm text-brand-slate">
                {item.journalTitle || "Journal unavailable"} | {item.articleType || "Article"}
              </p>
            </div>
            <p className="text-sm text-brand-slate">{new Date(item.createdAt).toLocaleString()}</p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-brand-border bg-brand-elevated p-4 text-sm text-brand-slate">
              <p className="font-semibold text-brand-ink">{item.name}</p>
              <a href={`mailto:${item.email}`} className="mt-3 flex items-center gap-2 transition hover:text-brand-ink">
                <Mail size={16} className="text-brand-gold" />
                {item.email}
              </a>
              <p className="mt-3 flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0 text-brand-gold" />
                <span>{item.postalAddress}</span>
              </p>
              <p className="mt-3">
                <span className="font-semibold text-brand-ink">Country:</span> {item.country}
              </p>
            </div>

            <div className="rounded-2xl border border-brand-border bg-brand-elevated p-4 text-sm text-brand-slate">
              <p className="font-semibold text-brand-ink">Abstract</p>
              <p className="mt-3 whitespace-pre-line leading-7">{item.abstract}</p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-brand-border bg-white p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-brand-teal">Attached Files</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {(item.files || []).map((file) => (
                <a
                  key={file.id}
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="button-secondary px-4 py-2"
                >
                  <FileText size={16} className="mr-2" />
                  {file.name}
                </a>
              ))}
              {item.journalUrl ? (
                <a href={`/journals/${item.journalUrl}/home`} className="button-soft px-4 py-2">
                  <ExternalLink size={16} className="mr-2" />
                  Open Journal
                </a>
              ) : null}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
