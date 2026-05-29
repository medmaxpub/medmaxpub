import {
  ChevronLeft,
  ChevronRight,
  FileText,
  ListTree,
  LoaderCircle,
  Maximize2,
  Minimize2,
  MonitorPlay,
  X
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { loadPdfJs } from "../../utils/pdfRuntime";

const viewModes = {
  width: { label: "Fit Width", zoomMode: "width" },
  page: { label: "Fit Page", zoomMode: "page" },
  zoom: { label: "125%", zoomMode: "custom", scale: 1.25 },
  outline: { label: "Outline", zoomMode: "width" }
};

function flattenOutline(items, depth = 0) {
  return (items || []).flatMap((item) => [
    { title: item.title || "Untitled", dest: item.dest, depth },
    ...flattenOutline(item.items || [], depth + 1)
  ]);
}

export default function PdfJsViewerModal({
  label,
  title,
  subtitle = "",
  fileUrl,
  onClose,
  allowPresentation = false,
  basicViewer = false,
  actions = [],
  emptyTitle = "Preview unavailable",
  emptyDescription = "This document preview is not available right now.",
  emptyActions = []
}) {
  const [pdfJs, setPdfJs] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [zoomMode, setZoomMode] = useState("width");
  const [customScale, setCustomScale] = useState(1.25);
  const [outlineEntries, setOutlineEntries] = useState([]);
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const viewerShellRef = useRef(null);
  const stageRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    setPageNumber(1);
    setZoomMode(basicViewer ? "page" : "width");
    setCustomScale(1.25);
    setOutlineOpen(false);
    setPresentationMode(false);
    setError("");
  }, [basicViewer, fileUrl]);

  useEffect(() => {
    let cancelled = false;

    loadPdfJs()
      .then((nextPdfJs) => {
        if (!cancelled) {
          setPdfJs(nextPdfJs);
        }
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(loadError.message || "Failed to load PDF.js");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!pdfJs || !fileUrl) {
      setPdfDoc(null);
      setPageCount(0);
      setOutlineEntries([]);
      return undefined;
    }

    let cancelled = false;
    let loadingTask = null;

    const loadDocument = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(fileUrl, {
          method: "GET",
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch PDF (${response.status})`);
        }

        const pdfBytes = new Uint8Array(await response.arrayBuffer());

        loadingTask = pdfJs.getDocument({
          data: pdfBytes
        });

        const nextDoc = await loadingTask.promise;

        if (cancelled) {
          await nextDoc.destroy();
          return;
        }

        const outline = await nextDoc.getOutline();
        setPdfDoc(nextDoc);
        setPageCount(nextDoc.numPages);
        setOutlineEntries(flattenOutline(outline));
      } catch (loadError) {
        if (!cancelled) {
          setPdfDoc(null);
          setPageCount(0);
          setOutlineEntries([]);
          setError(loadError.message || "Failed to load PDF document.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadDocument();

    return () => {
      cancelled = true;
      loadingTask?.destroy?.();
    };
  }, [fileUrl, pdfJs]);

  useEffect(() => {
    if (!stageRef.current) {
      return undefined;
    }

    const updateStageSize = () => {
      const rect = stageRef.current?.getBoundingClientRect();

      if (rect) {
        setStageSize({ width: rect.width, height: rect.height });
      }
    };

    updateStageSize();
    const resizeObserver = new ResizeObserver(updateStageSize);
    resizeObserver.observe(stageRef.current);
    window.addEventListener("resize", updateStageSize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateStageSize);
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === viewerShellRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (!pdfDoc || !fileUrl) {
      return undefined;
    }

    let cancelled = false;
    let renderTask = null;

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(pageNumber);

        if (cancelled) {
          return;
        }

        const baseViewport = page.getViewport({ scale: 1 });
        setPageSize({ width: baseViewport.width, height: baseViewport.height });

        const availableWidth = Math.max(stageSize.width - 32, 240);
        const availableHeight = Math.max(stageSize.height - 32, 240);
        const fitWidthScale = availableWidth / baseViewport.width;
        const fitPageScale = Math.min(availableWidth / baseViewport.width, availableHeight / baseViewport.height);
        const scale = zoomMode === "page" ? fitPageScale : zoomMode === "custom" ? customScale : fitWidthScale;
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;

        if (!canvas) {
          return;
        }

        const context = canvas.getContext("2d");
        const ratio = window.devicePixelRatio || 1;
        canvas.width = viewport.width * ratio;
        canvas.height = viewport.height * ratio;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);

        renderTask = page.render({
          canvasContext: context,
          viewport
        });

        await renderTask.promise;
      } catch (renderError) {
        if (!cancelled && renderError?.name !== "RenderingCancelledException") {
          setError(renderError.message || "Failed to render PDF page.");
        }
      }
    };

    renderPage();

    return () => {
      cancelled = true;
      renderTask?.cancel?.();
    };
  }, [customScale, fileUrl, pageNumber, pdfDoc, stageSize.height, stageSize.width, zoomMode]);

  useEffect(() => {
    if (!pdfDoc) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
        event.preventDefault();
        setPageNumber((current) => Math.min(current + 1, pdfDoc.numPages));
      }

      if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        setPageNumber((current) => Math.max(current - 1, 1));
      }

      if (event.key === "Escape" && presentationMode) {
        event.preventDefault();
        setPresentationMode(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pdfDoc, presentationMode]);

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

  const zoomLabel = useMemo(() => {
    if (!pageSize.width || !stageSize.width) {
      return "100%";
    }

    const availableWidth = Math.max(stageSize.width - 32, 240);
    const availableHeight = Math.max(stageSize.height - 32, 240);
    const fitWidthScale = availableWidth / pageSize.width;
    const fitPageScale = Math.min(availableWidth / pageSize.width, availableHeight / pageSize.height);
    const scale = zoomMode === "page" ? fitPageScale : zoomMode === "custom" ? customScale : fitWidthScale;

    return `${Math.round(scale * 100)}%`;
  }, [customScale, pageSize.height, pageSize.width, stageSize.height, stageSize.width, zoomMode]);

  const jumpToOutlineEntry = async (entry) => {
    if (!pdfDoc || !entry?.dest) {
      return;
    }

    try {
      const destination = typeof entry.dest === "string" ? await pdfDoc.getDestination(entry.dest) : entry.dest;
      const pageReference = destination?.[0];

      if (!pageReference) {
        return;
      }

      const pageIndex = await pdfDoc.getPageIndex(pageReference);
      setPageNumber(pageIndex + 1);
      setOutlineOpen(false);
    } catch {
      // Ignore outline navigation failures for malformed PDFs.
    }
  };

  const actionClassNames = {
    primary: "button-primary px-4 py-2",
    secondary: "button-secondary px-4 py-2",
    soft: "button-soft px-4 py-2"
  };

  if (!fileUrl) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm" onClick={onClose}>
        <div
          className="relative flex h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-[1.5rem] border border-white/10 bg-white shadow-[0_30px_120px_rgba(15,23,42,0.58)] sm:rounded-[2rem]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4 border-b border-brand-border px-4 py-4 sm:px-6 sm:py-5">
            <div className="min-w-0 pr-2">
              <p className="text-sm uppercase tracking-[0.18em] text-brand-teal">{label}</p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-brand-ink sm:text-3xl">{title}</h2>
              {subtitle ? <p className="mt-2 text-sm text-brand-slate">{subtitle}</p> : null}
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
          <div className="flex flex-1 items-center justify-center bg-slate-950 p-8 text-center">
            <div className="max-w-xl text-white">
              <h3 className="font-display text-2xl font-semibold">{emptyTitle}</h3>
              <p className="mt-4 leading-7 text-slate-300">{emptyDescription}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {emptyActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <a key={action.label} href={action.href} target="_blank" rel="noreferrer" className={actionClassNames[action.variant || "secondary"]}>
                      {Icon ? <Icon size={16} className="mr-2" /> : null}
                      {action.label}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        ref={viewerShellRef}
        className={`relative flex w-full flex-col overflow-hidden border border-white/10 bg-white shadow-[0_30px_120px_rgba(15,23,42,0.58)] ${
          presentationMode ? "h-[100vh] max-w-[100vw] rounded-none border-0 bg-slate-950 shadow-none" : "h-[92vh] max-w-7xl rounded-[1.5rem] sm:rounded-[2rem]"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        {!presentationMode ? (
          <div className="flex items-start justify-between gap-4 border-b border-brand-border px-4 py-4 sm:px-6 sm:py-5">
            <div className="min-w-0 pr-2">
              <p className="text-sm uppercase tracking-[0.18em] text-brand-teal">{label}</p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-brand-ink sm:text-3xl">{title}</h2>
              {subtitle ? <p className="mt-2 text-sm text-brand-slate">{subtitle}</p> : null}
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

        <div className={`flex h-full flex-col ${presentationMode ? "group/presentation" : ""}`}>
          {!presentationMode ? (
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-border bg-white px-4 py-3 sm:px-6 sm:py-4">
              <div className="flex flex-wrap items-center gap-2">
                {!basicViewer ? (
                  Object.entries(viewModes).map(([key, mode]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        if (key === "outline") {
                          setOutlineOpen((current) => !current);
                          setZoomMode("width");
                          return;
                        }

                        if (key === "zoom") {
                          setCustomScale(1.25);
                          setZoomMode("custom");
                          setOutlineOpen(false);
                          return;
                        }

                        setZoomMode(mode.zoomMode);
                        setOutlineOpen(false);
                      }}
                      className={`inline-flex items-center rounded-full px-4 py-2 text-sm ${
                        (key === "outline" ? outlineOpen : zoomMode === mode.zoomMode && (key !== "zoom" || customScale === 1.25))
                          ? "bg-slate-950 text-white"
                          : "bg-brand-elevated text-brand-slate"
                      }`}
                    >
                      {key === "outline" ? <ListTree size={16} className="mr-2" /> : <FileText size={16} className="mr-2" />}
                      {key === "zoom" ? zoomLabel : mode.label}
                    </button>
                  ))
                ) : (
                  <div className="inline-flex items-center rounded-full bg-brand-elevated px-4 py-2 text-sm font-medium text-brand-slate">
                    <FileText size={16} className="mr-2" />
                    Page View
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="inline-flex items-center rounded-full border border-brand-border bg-brand-elevated px-3 py-2 text-sm text-brand-ink">
                  <button type="button" className="rounded-full p-1 hover:bg-white" onClick={() => setPageNumber((current) => Math.max(current - 1, 1))} disabled={pageNumber <= 1}>
                    <ChevronLeft size={16} />
                  </button>
                  <span className="mx-2 min-w-0 text-center sm:min-w-20">
                    {pageCount ? `${pageNumber} / ${pageCount}` : "0 / 0"}
                  </span>
                  <button type="button" className="rounded-full p-1 hover:bg-white" onClick={() => setPageNumber((current) => Math.min(current + 1, pageCount || current))} disabled={pageNumber >= pageCount}>
                    <ChevronRight size={16} />
                  </button>
                </div>
                {allowPresentation && !basicViewer ? (
                  <button type="button" className="button-secondary px-4 py-2" onClick={togglePresentationMode}>
                    <MonitorPlay size={16} className="mr-2" />
                    Presentation View
                  </button>
                ) : null}
                <button type="button" className="button-secondary px-4 py-2" onClick={toggleFullscreen}>
                  {isFullscreen ? <Minimize2 size={16} className="mr-2" /> : <Maximize2 size={16} className="mr-2" />}
                  {isFullscreen ? "Exit Full Screen" : "Full Screen"}
                </button>
                {actions.map((action) => {
                  const Icon = action.icon || FileText;
                  return (
                    <a
                      key={action.label}
                      href={action.href}
                      target="_blank"
                      rel="noreferrer"
                      download={action.download ? true : undefined}
                      className={actionClassNames[action.variant || "secondary"]}
                    >
                      <Icon size={16} className="mr-2" />
                      {action.label}
                    </a>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-24 bg-gradient-to-b from-slate-950/85 via-slate-950/35 to-transparent opacity-0 transition-opacity duration-200 group-hover/presentation:opacity-100">
              <div className="pointer-events-auto absolute inset-x-0 top-0 flex items-center justify-between gap-3 px-5 py-4">
                <div className="inline-flex items-center rounded-full border border-white/20 bg-slate-950/70 px-4 py-2 text-sm font-medium text-white backdrop-blur">
                  <button type="button" className="rounded-full p-1 hover:bg-white/10" onClick={() => setPageNumber((current) => Math.max(current - 1, 1))} disabled={pageNumber <= 1}>
                    <ChevronLeft size={16} />
                  </button>
                  <span className="mx-2 min-w-24 text-center">{pageCount ? `${pageNumber} / ${pageCount}` : "0 / 0"}</span>
                  <button type="button" className="rounded-full p-1 hover:bg-white/10" onClick={() => setPageNumber((current) => Math.min(current + 1, pageCount || current))} disabled={pageNumber >= pageCount}>
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

          <div className={`relative flex flex-1 bg-slate-950 ${presentationMode ? "p-0" : "p-3 sm:p-5"}`}>
            {outlineOpen && !presentationMode && !basicViewer ? (
              <aside className="mr-4 hidden w-72 shrink-0 overflow-y-auto rounded-[1.5rem] border border-white/10 bg-white/95 p-4 lg:block">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-teal">Outline</p>
                <div className="mt-4 space-y-2">
                  {outlineEntries.length ? (
                    outlineEntries.map((entry, index) => (
                      <button
                        key={`${entry.title}-${index}`}
                        type="button"
                        className="block w-full rounded-2xl px-3 py-2 text-left text-sm text-brand-slate hover:bg-brand-elevated hover:text-brand-ink"
                        style={{ paddingLeft: `${12 + entry.depth * 16}px` }}
                        onClick={() => jumpToOutlineEntry(entry)}
                      >
                        {entry.title}
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-brand-slate">This document does not include outline entries.</p>
                  )}
                </div>
              </aside>
            ) : null}

            <div
              ref={stageRef}
              className={`relative flex-1 rounded-[1.5rem] border border-white/10 bg-[#0f172a] ${
                presentationMode ? "overflow-hidden rounded-none border-0" : basicViewer ? "overflow-auto" : "overflow-hidden"
              }`}
            >
              <div className={`flex min-h-full p-3 sm:p-4 ${basicViewer ? "items-start justify-center" : "items-center justify-center"}`}>
                {isLoading ? (
                  <div className="text-white" role="status" aria-label="Loading preview">
                    <LoaderCircle size={28} className="animate-spin" />
                  </div>
                ) : error ? (
                  <div className="max-w-xl text-center text-white">
                    <h3 className="font-display text-2xl font-semibold">Preview unavailable</h3>
                    <p className="mt-4 leading-7 text-slate-300">{error}</p>
                  </div>
                ) : (
                  <canvas ref={canvasRef} className="max-h-full max-w-full rounded-xl bg-white shadow-2xl" />
                )}
              </div>

              {presentationMode ? (
                <>
                  <button
                    type="button"
                    className="absolute left-4 top-1/2 z-20 inline-flex -translate-y-1/2 rounded-full border border-white/20 bg-slate-950/70 p-3 text-white backdrop-blur hover:bg-slate-900"
                    onClick={() => setPageNumber((current) => Math.max(current - 1, 1))}
                    disabled={pageNumber <= 1}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 z-20 inline-flex -translate-y-1/2 rounded-full border border-white/20 bg-slate-950/70 p-3 text-white backdrop-blur hover:bg-slate-900"
                    onClick={() => setPageNumber((current) => Math.min(current + 1, pageCount || current))}
                    disabled={pageNumber >= pageCount}
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              ) : null}
            </div>
          </div>

          {!presentationMode && !basicViewer ? (
            <div className="flex items-center gap-2 border-t border-brand-border bg-brand-elevated px-4 py-3 text-sm text-brand-slate sm:px-6">
              <FileText size={16} className="text-brand-teal" />
              PDF.js viewer with page navigation, zoom modes, outline, fullscreen, and responsive rendering.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
