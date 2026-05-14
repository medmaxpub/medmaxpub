import { ChevronDown, Download, ExternalLink } from "lucide-react";
import { useState } from "react";
import { buildPdfProxyUrl } from "../../utils/pdfProxy";

export default function IssueAccordion({ archive }) {
  const [openYear, setOpenYear] = useState(archive[0]?.year ?? null);

  return (
    <div className="space-y-4">
      {archive.map((yearBlock) => (
        <div key={yearBlock.year} className="card-panel overflow-hidden">
          <button
            type="button"
            onClick={() => setOpenYear((current) => (current === yearBlock.year ? null : yearBlock.year))}
            className="flex w-full items-center justify-between gap-4 px-4 py-5 text-left sm:px-6"
          >
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-brand-teal">Archive Year</p>
              <h3 className="mt-1 text-xl font-semibold text-brand-ink">{yearBlock.year}</h3>
            </div>
            <ChevronDown className={openYear === yearBlock.year ? "rotate-180 text-brand-ink" : "text-brand-ink"} />
          </button>

          {openYear === yearBlock.year ? (
            <div className="border-t border-brand-border px-4 py-5 sm:px-6">
              <div className="space-y-6">
                {yearBlock.volumes.map((volumeBlock) => (
                  <div key={volumeBlock.volume}>
                    <h4 className="text-lg font-semibold text-brand-ink">Volume {volumeBlock.volume}</h4>
                    <div className="mt-3 space-y-4">
                      {volumeBlock.issues.map((issue) => (
                        <div key={issue.issue} className="rounded-2xl border border-brand-border bg-brand-elevated p-4">
                          <p className="font-medium text-brand-ink">Issue {issue.issue}</p>
                          <div className="mt-3 space-y-3">
                            {issue.articles.map((article) => {
                              const viewPdfUrl = buildPdfProxyUrl(article.pdfUrl);
                              const downloadPdfUrl = buildPdfProxyUrl(article.pdfUrl, { download: true });

                              return (
                                <div
                                  key={article.id}
                                  className="flex flex-col gap-3 rounded-2xl border border-brand-border bg-brand-surface p-4 lg:flex-row lg:items-center lg:justify-between"
                                >
                                  <div>
                                    <h5 className="font-semibold text-brand-ink">{article.title}</h5>
                                    <p className="mt-1 text-sm text-brand-slate">{article.authors.join(", ")}</p>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    <a className="button-soft px-4 py-2" href={viewPdfUrl || article.pdfUrl} target="_blank" rel="noreferrer">
                                      <ExternalLink size={16} className="mr-2" />
                                      View PDF
                                    </a>
                                    <a className="button-primary px-4 py-2" href={downloadPdfUrl || article.pdfUrl} target="_blank" rel="noreferrer">
                                      <Download size={16} className="mr-2" />
                                      Download PDF
                                    </a>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
