import { Download, ExternalLink, FileText, Maximize2, Minimize2, PanelLeftClose, PanelLeftOpen, Printer, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { buildPdfViewerUrl } from "../../utils/pptPreview";
import { buildPdfProxyUrl } from "../../utils/pdfProxy";

const pdfViewModes = {
  width: {
    label: "Fit Width",
    icon: PanelLeftClose,
    options: { zoom: "page-width", view: "FitH", navpanes: 0 }
  },
  page: {
    label: "Fit Page",
    icon: FileText,
    options: { zoom: "page-fit", view: "FitV", navpanes: 0 }
  },
  outline: {
    label: "Outline",
    icon: PanelLeftOpen,
    options: { zoom: "page-width", view: "FitH", navpanes: 1 }
  },
  zoom: {
    label: "125%",
    icon: FileText,
    options: { zoom: "125", view: "FitH", navpanes: 0 }
  }
};

export default function PdfPreviewModal({ pdf, onClose }) {
  const [viewMode, setViewMode] = useState("width");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const viewerShellRef = useRef(null);
  const inlinePdfUrl = useMemo(() => buildPdfProxyUrl(pdf?.fileUrl), [pdf?.fileUrl]);
  const downloadPdfUrl = useMemo(() => buildPdfProxyUrl(pdf?.fileUrl, { download: true }), [pdf?.fileUrl]);

  const iframeUrl = useMemo(() => buildPdfViewerUrl(inlinePdfUrl, pdfViewModes[viewMode].options), [inlinePdfUrl, viewMode]);

  useEffect(() => {
    setViewMode("width");
  }, [pdf?.fileUrl]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === viewerShellRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  if (!pdf) {
    return null;
  }

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        ref={viewerShellRef}
        className="relative flex h-[88vh] w-full max-w-7xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-[0_30px_120px_rgba(15,23,42,0.58)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-brand-border px-6 py-5">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-brand-teal">Journal PDF</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-brand-ink">{pdf.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-brand-border bg-brand-sky p-3 text-brand-slate hover:bg-brand-elevated hover:text-brand-ink"
            aria-label="Close PDF preview"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-border bg-white px-6 py-4">
          <div className="flex flex-wrap gap-2">
            {Object.entries(pdfViewModes).map(([key, mode]) => {
              const Icon = mode.icon;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setViewMode(key)}
                  className={`inline-flex items-center rounded-full px-4 py-2 text-sm ${
                    viewMode === key ? "bg-slate-950 text-white" : "bg-brand-elevated text-brand-slate"
                  }`}
                >
                  <Icon size={16} className="mr-2" />
                  {mode.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="button" className="button-secondary px-4 py-2" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize2 size={16} className="mr-2" /> : <Maximize2 size={16} className="mr-2" />}
              {isFullscreen ? "Exit Full Screen" : "Full Screen"}
            </button>
            <a href={inlinePdfUrl || pdf.fileUrl} target="_blank" rel="noreferrer" className="button-soft px-4 py-2">
              <Printer size={16} className="mr-2" />
              Print-Friendly Tab
            </a>
            <a href={inlinePdfUrl || pdf.fileUrl} target="_blank" rel="noreferrer" className="button-secondary px-4 py-2">
              <ExternalLink size={16} className="mr-2" />
              Open in New Tab
            </a>
            <a href={downloadPdfUrl || pdf.fileUrl} target="_blank" rel="noreferrer" className="button-primary px-4 py-2">
              <Download size={16} className="mr-2" />
              Download PDF
            </a>
          </div>
        </div>

        <div className="flex items-center gap-2 border-b border-brand-border bg-brand-elevated px-6 py-3 text-sm text-brand-slate">
          <FileText size={16} className="text-brand-teal" />
          Embedded PDF viewer with toolbar enabled. Switch modes above for page fit, width fit, outline, and zoom presets.
        </div>

        <div className="flex-1 bg-slate-950 p-4 sm:p-5">
          <div className="h-full overflow-hidden rounded-[1.5rem] border border-white/10 bg-white">
            <iframe title={pdf.title} src={iframeUrl || inlinePdfUrl || pdf.fileUrl} className="h-full w-full bg-white" loading="lazy" allowFullScreen />
          </div>
        </div>
      </div>
    </div>
  );
}
