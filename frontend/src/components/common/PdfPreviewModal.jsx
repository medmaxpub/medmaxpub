import { Download, ExternalLink, FileText, X } from "lucide-react";

export default function PdfPreviewModal({ pdf, onClose }) {
  if (!pdf) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4" onClick={onClose}>
      <div className="card-panel relative flex h-[85vh] w-full max-w-6xl flex-col overflow-hidden" onClick={(event) => event.stopPropagation()}>
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

        <div className="flex flex-wrap gap-3 border-b border-brand-border bg-white px-6 py-4">
          <button type="button" className="button-soft px-4 py-2">
            <FileText size={16} className="mr-2" />
            Embedded Preview
          </button>
          <a href={pdf.fileUrl} target="_blank" rel="noreferrer" className="button-secondary px-4 py-2">
            <ExternalLink size={16} className="mr-2" />
            Open in New Tab
          </a>
          <a href={pdf.fileUrl} target="_blank" rel="noreferrer" className="button-primary px-4 py-2">
            <Download size={16} className="mr-2" />
            Download PDF
          </a>
        </div>

        <iframe title={pdf.title} src={pdf.fileUrl} className="h-full w-full bg-white" loading="lazy" />
      </div>
    </div>
  );
}
