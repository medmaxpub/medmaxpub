import { AlertCircle, Download, ExternalLink, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function PptPreviewModal({ ppt, onClose }) {
  const [activeViewerIndex, setActiveViewerIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState("");
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const activePpt = ppt || {};

  const viewerCandidates = useMemo(
    () =>
      [
        activePpt.pdfViewerUrl ? { label: "PDF Preview", url: activePpt.pdfViewerUrl } : null,
        activePpt.googleViewerUrl ? { label: "Google Viewer", url: activePpt.googleViewerUrl } : null,
        activePpt.officeViewerUrl ? { label: "Alternate Viewer", url: activePpt.officeViewerUrl } : null
      ].filter(Boolean),
    [activePpt.googleViewerUrl, activePpt.officeViewerUrl, activePpt.pdfViewerUrl]
  );

  const activeViewer = viewerCandidates[activeViewerIndex] || null;

  useEffect(() => {
    setActiveViewerIndex(0);
    setIframeLoaded(false);
    setToastMessage(activePpt.previewIssue || "");
  }, [activePpt]);

  useEffect(() => {
    if (!toastMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setToastMessage(""), 4000);
    return () => window.clearTimeout(timeoutId);
  }, [toastMessage]);

  useEffect(() => {
    if (!activeViewer?.url) {
      return undefined;
    }

    setIframeLoaded(false);

    const timeoutId = window.setTimeout(() => {
      if (iframeLoaded) {
        return;
      }

      if (activeViewerIndex < viewerCandidates.length - 1) {
        setActiveViewerIndex((current) => current + 1);
        setToastMessage(`${activeViewer.label} is unavailable. Trying another preview option.`);
        return;
      }

      setToastMessage("Preview could not be embedded. You can still open or download the PPT.");
    }, 4500);

    return () => window.clearTimeout(timeoutId);
  }, [activeViewer, activeViewerIndex, iframeLoaded, viewerCandidates.length]);

  if (!ppt) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy/75 p-4" onClick={onClose}>
      <div className="card-panel relative flex h-[85vh] w-full max-w-6xl flex-col overflow-hidden" onClick={(event) => event.stopPropagation()}>
        {toastMessage ? (
          <div className="absolute right-6 top-6 z-10 max-w-md rounded-2xl bg-brand-navy px-4 py-3 text-sm text-white shadow-xl">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <p>{toastMessage}</p>
            </div>
          </div>
        ) : null}

        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-brand-teal">PPT Preview</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-brand-navy">{ppt.title}</h2>
            {ppt.journalTitle ? <p className="mt-2 text-sm text-slate-500">{ppt.journalTitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 p-3 text-slate-500 hover:bg-slate-100 hover:text-brand-navy"
            aria-label="Close preview"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 bg-slate-50">
          {activeViewer?.url ? (
            <div className="flex h-full flex-col">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-6 py-3">
                <div className="flex flex-wrap gap-2">
                  {viewerCandidates.map((candidate, index) => (
                    <button
                      key={candidate.label}
                      type="button"
                      onClick={() => {
                        setActiveViewerIndex(index);
                        setToastMessage("");
                      }}
                      className={`rounded-full px-3 py-2 text-sm ${
                        activeViewerIndex === index ? "bg-brand-navy text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {candidate.label}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  {ppt.previewPdfUrl ? (
                    <a
                      href={ppt.previewPdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="button-soft px-4 py-2"
                    >
                      <ExternalLink size={16} className="mr-2" />
                      Open Preview PDF
                    </a>
                  ) : null}
                  {ppt.downloadUrl ? (
                    <a
                      href={ppt.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      download
                      className="button-primary px-4 py-2"
                    >
                      <Download size={16} className="mr-2" />
                      Download PPT
                    </a>
                  ) : null}
                </div>
              </div>
              <iframe
                title={`${ppt.title} preview`}
                src={activeViewer.url}
                className="h-full w-full"
                loading="lazy"
                referrerPolicy="no-referrer"
                onLoad={() => setIframeLoaded(true)}
              />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center p-8">
              <div className="max-w-xl text-center">
                <h3 className="font-display text-2xl font-semibold text-brand-navy">Preview unavailable</h3>
                <p className="mt-4 leading-7 text-slate-600">
                  This PPT does not have a valid embeddable preview right now. Upload a preview PDF or verify that the PPT file URL is
                  public and reachable from the browser.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  {ppt.downloadUrl ? (
                    <a
                      href={ppt.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      download
                      className="button-primary px-4 py-2"
                    >
                      <Download size={16} className="mr-2" />
                      Download PPT
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
