import { Download, X } from "lucide-react";

export default function PptPreviewModal({ ppt, onClose }) {
  if (!ppt) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy/75 p-4" onClick={onClose}>
      <div className="card-panel relative flex h-[85vh] w-full max-w-6xl flex-col overflow-hidden" onClick={(event) => event.stopPropagation()}>
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
          {ppt.modalPreviewUrl ? (
            <iframe title={`${ppt.title} preview`} src={ppt.modalPreviewUrl} className="h-full w-full" />
          ) : (
            <div className="flex h-full items-center justify-center p-8">
              <div className="max-w-xl text-center">
                <h3 className="font-display text-2xl font-semibold text-brand-navy">Preview file required</h3>
                <p className="mt-4 leading-7 text-slate-600">
                  This PPT does not have an embeddable preview yet. Upload a preview PDF in the admin portal to show slides here in
                  the popup viewer.
                </p>
                <a href={ppt.fileUrl} className="button-primary mt-6 px-4 py-2">
                  <Download size={16} className="mr-2" />
                  Download PPT
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
