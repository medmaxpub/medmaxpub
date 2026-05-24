import { Download, FileText, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { shouldUseDevelopmentFallback, withFallback } from "../../api/client";
import EmptyState from "../../components/common/EmptyState";
import SectionHeader from "../../components/common/SectionHeader";
import { mockPpts } from "../../data/mockData";
import { normalizePptItem } from "../../utils/pptPreview";

export default function PptViewerPage() {
  const { pptId } = useParams();
  const [ppt, setPpt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewerReloadToken, setViewerReloadToken] = useState(0);
  const useDevelopmentFallback = shouldUseDevelopmentFallback();

  const loadPpt = useCallback(async () => {
    setIsLoading(true);

    const fallbackItem = useDevelopmentFallback ? mockPpts.find((item) => String(item.id) === String(pptId)) || null : null;
    const record = await withFallback(() => api.get(`/ppts/${pptId}`), fallbackItem);
    const normalized = record ? normalizePptItem(record.data || record) : null;

    setPpt(normalized);
    setIsLoading(false);
  }, [pptId, useDevelopmentFallback]);

  useEffect(() => {
    loadPpt();
  }, [loadPpt]);

  const embeddedViewerUrl = useMemo(() => {
    if (!ppt) {
      return null;
    }

    return ppt.officeViewerPageUrl || ppt.officeViewerUrl || ppt.googleViewerUrl || ppt.pdfViewerUrl || null;
  }, [ppt]);

  if (isLoading) {
    return (
      <div className="section-shell">
        <div className="container-shell">
          <EmptyState title="Loading PPT viewer" description="The presentation page is being prepared." />
        </div>
      </div>
    );
  }

  if (!ppt) {
    return (
      <div className="section-shell">
        <div className="container-shell">
          <EmptyState title="PPT not found" description="This presentation could not be loaded." />
        </div>
      </div>
    );
  }

  if (!embeddedViewerUrl) {
    return (
      <div className="section-shell">
        <div className="container-shell">
          <EmptyState
            title="Viewer unavailable"
            description="This PPT does not have a usable public preview URL yet."
            actions={
              ppt.downloadUrl
                ? [
                    {
                      label: "Download PPT",
                      href: ppt.downloadUrl,
                      external: true
                    }
                  ]
                : []
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="section-shell">
      <div className="container-shell">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <SectionHeader
            label={ppt.journalTitle || "PPT Presentation"}
            title={ppt.title || "Presentation"}
          />
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="button-secondary px-4 py-2"
              onClick={() => setViewerReloadToken((current) => current + 1)}
            >
              <RotateCcw size={16} className="mr-2" />
              Restart from Beginning
            </button>
            <Link to="/ppts" className="button-secondary px-4 py-2">
              Back to PPT Archive
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(18rem,0.75fr)]">
          <div className="overflow-hidden rounded-[2rem] border border-brand-border bg-slate-950 shadow-panel">
            <div className="relative min-h-[70vh] bg-slate-950">
              <iframe
                key={`${embeddedViewerUrl}-${viewerReloadToken}`}
                src={embeddedViewerUrl}
                title={ppt.title || "Embedded PPT viewer"}
                className="absolute inset-0 h-full w-full border-0"
                allow="autoplay; fullscreen"
                allowFullScreen
                loading="eager"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="card-panel p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-brand-ink">Presentation Details</h2>
              <dl className="mt-4 space-y-4 text-sm text-brand-slate">
                <div>
                  <dt className="font-semibold text-brand-ink">Journal</dt>
                  <dd className="mt-1 break-words">{ppt.journalTitle || "Not available"}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-brand-ink">Author</dt>
                  <dd className="mt-1 break-words">{ppt.authorName || "Not available"}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-brand-ink">DOI</dt>
                  <dd className="mt-1 break-words">{ppt.doiNumber || "Not available"}</dd>
                </div>
              </dl>
            </div>

            <div className="card-panel p-5 sm:p-6">
              <div className="flex flex-wrap gap-3">
                {ppt.downloadUrl ? (
                  <a href={ppt.downloadUrl} download className="button-primary px-4 py-2">
                    <Download size={16} className="mr-2" />
                    Download PPT
                  </a>
                ) : null}
                {ppt.previewUrl ? (
                  <a href={ppt.previewUrl} target="_blank" rel="noreferrer" className="button-secondary px-4 py-2">
                    <FileText size={16} className="mr-2" />
                    Open PDF Preview
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
