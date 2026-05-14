import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  ListTree,
  Maximize2,
  Minimize2,
  MonitorPlay,
  X
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { buildPdfViewerUrl, warmPreviewUrl } from "../../utils/pptPreview";

const pdfViewModes = {
  width: {
    label: "Fit Width",
    options: { zoom: "page-width", view: "FitH", navpanes: 0 }
  },
  page: {
    label: "Fit Page",
    options: { zoom: "page-fit", view: "FitV", navpanes: 0 }
  },
  actual: {
    label: "125%",
    options: { zoom: "125", view: "FitH", navpanes: 0 }
  },
  outline: {
    label: "Outline",
    options: { zoom: "page-width", view: "FitH", navpanes: 1 }
  }
};

export default function PptPreviewModal({ ppt, onClose }) {
  const [activeViewerIndex, setActiveViewerIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState("");
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [pdfViewMode, setPdfViewMode] = useState("width");
  const [presentationMode, setPresentationMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pdfPageNumber, setPdfPageNumber] = useState(1);
  const [pdfError, setPdfError] = useState("");
  const [outlineOpen, setOutlineOpen] = useState(false);
  const viewerShellRef = useRef(null);
  const activePpt = ppt || {};

  const viewerCandidates = useMemo(
    () =>
      [
        activePpt.previewPdfUrl ? { label: "PDF Preview", type: "pdf", url: activePpt.previewPdfUrl } : null,
        activePpt.googleViewerUrl ? { label: "Google Viewer", type: "external", url: activePpt.googleViewerUrl } : null,
        activePpt.officeViewerUrl ? { label: "Alternate Viewer", type: "external", url: activePpt.officeViewerUrl } : null
      ].filter(Boolean),
    [activePpt.googleViewerUrl, activePpt.officeViewerUrl, activePpt.previewPdfUrl]
  );

  const activeViewer = viewerCandidates[activeViewerIndex] || null;
  const isPdfViewer = activeViewer?.type === "pdf" && Boolean(activeViewer?.url);

  useEffect(() => {
    setActiveViewerIndex(0);
    setToastMessage(activePpt.previewIssue || "");
    setIframeLoaded(false);
    setPdfViewMode("width");
    setPresentationMode(false);
    setPdfPageNumber(1);
    setPdfError("");
    setOutlineOpen(false);
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

    warmPreviewUrl(activeViewer.url);
    setIframeLoaded(false);
    setPdfError("");
    const timeoutId = window.setTimeout(() => {
      if (iframeLoaded) {
        return;
      }

      if (!isPdfViewer && activeViewerIndex < viewerCandidates.length - 1) {
        setActiveViewerIndex((current) => current + 1);
        setToastMessage(`${activeViewer.label} is unavailable. Trying another preview option.`);
        return;
      }

      if (isPdfViewer) {
        setToastMessage("Preview is taking longer than expected. You can still use Open Preview PDF or Download PPT.");
        return;
      }

      setPdfError("Preview could not be embedded. Use Open Preview PDF or Download PPT.");
    }, isPdfViewer ? 8000 : 4500);

    return () => window.clearTimeout(timeoutId);
  }, [activeViewer, activeViewerIndex, iframeLoaded, isPdfViewer, viewerCandidates.length]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === viewerShellRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (!isPdfViewer) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
        event.preventDefault();
        setPdfPageNumber((current) => current + 1);
      }

      if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        setPdfPageNumber((current) => Math.max(current - 1, 1));
      }

      if (event.key === "Escape" && presentationMode) {
        event.preventDefault();
        setPresentationMode(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPdfViewer, presentationMode]);

  const toggleFullscreen = async () => {
    if (!viewerShellRef.current) {
      return;
    }

    if (document.fullscreenElement === viewerShellRef.current) {
      await document.exitFullscreen?.();
      return;
    }

    await viewerShellRef.current.requestFullscreen?.();
  };

  const togglePresentationMode = async () => {
    const nextMode = !presentationMode;
    setPresentationMode(nextMode);

    if (!nextMode) {
      return;
    }

    if (viewerShellRef.current && document.fullscreenElement !== viewerShellRef.current) {
      await viewerShellRef.current.requestFullscreen?.();
    }
  };

  const goToPreviousPage = () => {
    setPdfPageNumber((current) => Math.max(current - 1, 1));
  };

  const goToNextPage = () => {
    setPdfPageNumber((current) => current + 1);
  };

  const pageLabel = isPdfViewer ? `Page ${pdfPageNumber}` : "";
  const pdfViewerUrl = isPdfViewer
    ? buildPdfViewerUrl(activeViewer.url, {
        ...(pdfViewModes[pdfViewMode]?.options || pdfViewModes.width.options),
        navpanes: outlineOpen && !presentationMode ? 1 : 0,
        toolbar: presentationMode ? 0 : 1,
        scrollbar: presentationMode ? 0 : 1,
        page: pdfPageNumber
      })
    : null;

  if (!ppt) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`relative flex w-full flex-col overflow-hidden border border-white/10 bg-white shadow-[0_30px_120px_rgba(15,23,42,0.58)] ${
          presentationMode ? "h-[100vh] max-w-[100vw] rounded-none border-0 bg-slate-950 shadow-none" : "h-[88vh] max-w-7xl rounded-[2rem]"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        {toastMessage ? (
          <div className="absolute right-6 top-6 z-10 max-w-md rounded-2xl bg-brand-navy px-4 py-3 text-sm text-white shadow-xl">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <p>{toastMessage}</p>
            </div>
          </div>
        ) : null}

        {!presentationMode ? (
          <div className="flex items-start justify-between gap-4 border-b border-brand-border px-6 py-5">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-brand-teal">PPT Preview</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-brand-ink">{ppt.title}</h2>
              {ppt.journalTitle ? <p className="mt-2 text-sm text-brand-slate">{ppt.journalTitle}</p> : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-brand-border bg-brand-sky p-3 text-brand-slate hover:bg-brand-elevated hover:text-brand-ink"
              aria-label="Close preview"
            >
              <X size={18} />
            </button>
          </div>
        ) : null}

        <div ref={viewerShellRef} className="flex-1 bg-slate-950">
          {activeViewer?.url ? (
            <div className={`flex h-full flex-col ${presentationMode ? "group/presentation" : ""}`}>
              {!presentationMode ? (
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white px-6 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {viewerCandidates.map((candidate, index) => (
                      <button
                        key={candidate.label}
                        type="button"
                        onClick={() => {
                          setActiveViewerIndex(index);
                          setToastMessage("");
                          setIframeLoaded(false);
                          setPdfError("");
                          setPdfPageNumber(1);
                        }}
                        className={`rounded-full px-3 py-2 text-sm ${
                          activeViewerIndex === index ? "bg-brand-navy text-white" : "bg-brand-elevated text-brand-slate"
                        }`}
                      >
                        {candidate.label}
                      </button>
                    ))}

                    {isPdfViewer
                      ? Object.entries(pdfViewModes).map(([key, mode]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              setPdfError("");
                              setIframeLoaded(false);

                              if (key === "outline") {
                                setOutlineOpen((current) => !current);
                                setPdfViewMode("outline");
                                return;
                              }

                              setOutlineOpen(false);
                              setPdfViewMode(key);
                            }}
                            className={`rounded-full px-3 py-2 text-sm ${
                              (key === "outline" ? outlineOpen : pdfViewMode === key) ? "bg-slate-950 text-white" : "bg-brand-elevated text-brand-slate"
                            }`}
                          >
                            {key === "outline" ? (
                              <span className="inline-flex items-center">
                                <ListTree size={14} className="mr-2" />
                                {mode.label}
                              </span>
                            ) : (
                              mode.label
                            )}
                          </button>
                        ))
                      : null}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {isPdfViewer ? (
                      <>
                        <div className="inline-flex items-center rounded-full border border-brand-border bg-brand-elevated px-3 py-2 text-sm text-brand-ink">
                          <button type="button" className="rounded-full p-1 hover:bg-white" onClick={goToPreviousPage} disabled={pdfPageNumber <= 1}>
                            <ChevronLeft size={16} />
                          </button>
                          <span className="mx-2 min-w-20 text-center">{pageLabel}</span>
                          <button type="button" className="rounded-full p-1 hover:bg-white" onClick={goToNextPage}>
                            <ChevronRight size={16} />
                          </button>
                        </div>
                        <button type="button" className="button-secondary px-4 py-2" onClick={togglePresentationMode}>
                          <MonitorPlay size={16} className="mr-2" />
                          Presentation View
                        </button>
                      </>
                    ) : null}

                    <button type="button" className="button-secondary px-4 py-2" onClick={toggleFullscreen}>
                      {isFullscreen ? <Minimize2 size={16} className="mr-2" /> : <Maximize2 size={16} className="mr-2" />}
                      {isFullscreen ? "Exit Full Screen" : "Full Screen"}
                    </button>

                    {ppt.previewPdfUrl ? (
                      <a href={ppt.previewPdfUrl} target="_blank" rel="noreferrer" className="button-soft px-4 py-2">
                        <ExternalLink size={16} className="mr-2" />
                        Open Preview PDF
                      </a>
                    ) : null}

                    {ppt.downloadUrl ? (
                      <a href={ppt.downloadUrl} target="_blank" rel="noreferrer" download className="button-primary px-4 py-2">
                        <Download size={16} className="mr-2" />
                        Download PPT
                      </a>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-24 bg-gradient-to-b from-slate-950/85 via-slate-950/35 to-transparent opacity-0 transition-opacity duration-200 group-hover/presentation:opacity-100">
                  <div className="pointer-events-auto absolute inset-x-0 top-0 flex items-center justify-between gap-3 px-5 py-4">
                    <div className="inline-flex items-center rounded-full border border-white/20 bg-slate-950/70 px-4 py-2 text-sm font-medium text-white backdrop-blur">
                      <button type="button" className="rounded-full p-1 hover:bg-white/10" onClick={goToPreviousPage} disabled={pdfPageNumber <= 1}>
                        <ChevronLeft size={16} />
                      </button>
                      <span className="mx-2 min-w-24 text-center">{pageLabel}</span>
                      <button type="button" className="rounded-full p-1 hover:bg-white/10" onClick={goToNextPage}>
                        <ChevronRight size={16} />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        className="inline-flex items-center rounded-full border border-white/20 bg-slate-950/70 px-4 py-2 text-sm font-medium text-white backdrop-blur"
                        onClick={togglePresentationMode}
                      >
                        <MonitorPlay size={16} className="mr-2" />
                        Exit Presentation
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center rounded-full border border-white/20 bg-slate-950/70 px-4 py-2 text-sm font-medium text-white backdrop-blur"
                        onClick={toggleFullscreen}
                      >
                        {isFullscreen ? <Minimize2 size={16} className="mr-2" /> : <Maximize2 size={16} className="mr-2" />}
                        {isFullscreen ? "Exit Full Screen" : "Full Screen"}
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center rounded-full border border-white/20 bg-slate-950/70 px-4 py-2 text-sm font-medium text-white backdrop-blur"
                        onClick={onClose}
                      >
                        <X size={16} className="mr-2" />
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className={`relative flex-1 bg-slate-950 ${presentationMode ? "p-0" : "p-4 sm:p-5"}`}>
                {pdfError ? (
                  <div className="absolute inset-0 z-10 flex items-center justify-center p-8">
                    <div className="max-w-xl text-center text-white">
                      <h3 className="font-display text-2xl font-semibold">Preview unavailable</h3>
                      <p className="mt-4 leading-7 text-slate-300">{pdfError}</p>
                    </div>
                  </div>
                ) : null}

                {isPdfViewer && pdfViewerUrl ? (
                  <div className={`h-full overflow-hidden border border-white/10 bg-white ${presentationMode ? "rounded-none border-0" : "rounded-[1.5rem]"}`}>
                    <iframe
                      key={pdfViewerUrl}
                      title={`${ppt.title} PDF preview`}
                      src={pdfViewerUrl}
                      className="h-full w-full bg-white"
                      loading="eager"
                      referrerPolicy="no-referrer"
                      allowFullScreen
                      onLoad={() => {
                        setIframeLoaded(true);
                        setPdfError("");
                      }}
                    />
                  </div>
                ) : (
                  <div className={`h-full overflow-hidden border border-white/10 bg-white ${presentationMode ? "rounded-none border-0" : "rounded-[1.5rem]"}`}>
                    <iframe
                      key={activeViewer.url}
                      title={`${ppt.title} preview`}
                      src={activeViewer.url}
                      className="h-full w-full bg-white"
                      loading="eager"
                      referrerPolicy="no-referrer"
                      allowFullScreen
                      onLoad={() => {
                        setIframeLoaded(true);
                        setPdfError("");
                      }}
                    />
                  </div>
                )}

                {presentationMode && isPdfViewer ? (
                  <>
                    <button
                      type="button"
                      className="absolute left-4 top-1/2 z-20 inline-flex -translate-y-1/2 rounded-full border border-white/20 bg-slate-950/70 p-3 text-white backdrop-blur hover:bg-slate-900"
                      onClick={goToPreviousPage}
                      disabled={pdfPageNumber <= 1}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 z-20 inline-flex -translate-y-1/2 rounded-full border border-white/20 bg-slate-950/70 p-3 text-white backdrop-blur hover:bg-slate-900"
                      onClick={goToNextPage}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center p-8">
              <div className="max-w-xl text-center">
                <h3 className="font-display text-2xl font-semibold text-white">Preview unavailable</h3>
                <p className="mt-4 leading-7 text-slate-300">
                  This PPT does not have a valid embeddable preview right now. Upload a preview PDF or verify that the PPT file URL is
                  public and reachable from the browser.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  {ppt.downloadUrl ? (
                    <a href={ppt.downloadUrl} target="_blank" rel="noreferrer" download className="button-primary px-4 py-2">
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
