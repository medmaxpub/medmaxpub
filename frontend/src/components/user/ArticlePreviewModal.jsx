import { Download, ExternalLink, X } from "lucide-react";
import { buildPdfProxyUrl } from "../../utils/pdfProxy";
import { indexingLinkFields, stripHtml } from "./userPortalShared";

export default function ArticlePreviewModal({ article, onClose }) {
  if (!article) {
    return null;
  }

  const viewPdfUrl = article.pdfFileUrl ? buildPdfProxyUrl(article.pdfFileUrl) || article.pdfFileUrl : "";
  const downloadPdfUrl = article.pdfFileUrl ? buildPdfProxyUrl(article.pdfFileUrl, { download: true }) || article.pdfFileUrl : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy/80 p-4" onClick={onClose}>
      <div
        className="card-panel relative max-h-[calc(100vh-2rem)] w-full max-w-5xl overflow-y-auto p-5 sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="absolute right-5 top-5 rounded-full border border-brand-border bg-brand-elevated p-3 text-brand-ink hover:bg-brand-sky"
          onClick={onClose}
        >
          <X size={18} />
        </button>

        <p className="eyebrow">Article Preview</p>
        <h2 className="pr-12 font-display text-2xl font-semibold text-brand-ink sm:text-3xl">{stripHtml(article.title)}</h2>
        <p className="mt-3 text-xs uppercase tracking-[0.16em] text-brand-slate sm:text-sm sm:tracking-[0.18em]">
          {article.status.replaceAll("_", " ")} | Vol. {article.volume}, Issue {article.issueNumber}
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <div className="rounded-3xl border border-brand-border bg-brand-elevated p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-brand-teal">Author Names</p>
              <div className="rich-copy mt-3 text-brand-slate" dangerouslySetInnerHTML={{ __html: article.authorNames || "<p>Not available.</p>" }} />
            </div>

            <div className="rounded-3xl border border-brand-border bg-brand-elevated p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-brand-teal">Abstract</p>
              <div className="rich-copy mt-3 text-brand-slate" dangerouslySetInnerHTML={{ __html: article.abstractText || "<p>Not available.</p>" }} />
            </div>

            <div className="rounded-3xl border border-brand-border bg-brand-elevated p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-brand-teal">Citation</p>
              <div className="rich-copy mt-3 text-brand-slate" dangerouslySetInnerHTML={{ __html: article.citeAs || "<p>Not available.</p>" }} />
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-3xl border border-brand-border bg-brand-elevated p-5 text-sm text-brand-slate">
              <p>
                <span className="font-semibold text-brand-ink">Corresponding Email:</span> {article.correspondingAuthorEmail}
              </p>
              <p className="mt-3">
                <span className="font-semibold text-brand-ink">Keywords:</span> {article.keywords}
              </p>
              <p className="mt-3">
                <span className="font-semibold text-brand-ink">Country:</span> {article.country}
              </p>
              <p className="mt-3">
                <span className="font-semibold text-brand-ink">Published:</span> {article.publishedDate?.slice?.(0, 10) || "NA"}
              </p>
              <p className="mt-3">
                <span className="font-semibold text-brand-ink">DOI:</span> {article.doiNumber || "NA"}
              </p>
            </div>

            <div className="rounded-3xl border border-brand-border bg-brand-surface p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-brand-teal">Files & Links</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {article.pdfFileUrl ? (
                  <>
                    <a href={viewPdfUrl} target="_blank" rel="noreferrer" className="button-primary px-4 py-2">
                      <ExternalLink size={16} className="mr-2" />
                      View PDF
                    </a>
                    <a href={downloadPdfUrl} target="_blank" rel="noreferrer" className="button-secondary px-4 py-2">
                      <Download size={16} className="mr-2" />
                      Download PDF
                    </a>
                  </>
                ) : null}
                {article.supplementaryFiles?.map((file) => (
                  <a key={file.id} href={file.url} target="_blank" rel="noreferrer" className="button-secondary px-4 py-2">
                    <ExternalLink size={16} className="mr-2" />
                    {file.name}
                  </a>
                ))}
              </div>

              <div className="mt-5 grid gap-3">
                {indexingLinkFields.map((item) =>
                  article.indexingLinks?.[item.key] ? (
                    <a
                      key={item.key}
                      href={article.indexingLinks[item.key]}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-2xl border border-brand-border bg-brand-elevated px-4 py-3 text-sm text-brand-slate hover:border-brand-teal hover:text-brand-ink"
                    >
                      {item.label}
                    </a>
                  ) : null
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
