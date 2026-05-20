import { FileText, Upload, X } from "lucide-react";
import { useState } from "react";
import api from "../../api/client";

export default function JournalPdfUploadModal({ open, journalId, journalName, onClose, onUploaded }) {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!journalId) {
      setStatus("Select a journal first.");
      return;
    }

    if (!files.length) {
      setStatus("Choose at least one PDF file.");
      return;
    }

    setSubmitting(true);
    setStatus("");

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("pdfFile", file);
      });

      const response = await api.post(`/journals/${journalId}/pdf`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const count = response.data?.items?.length || files.length;
      const message = `${count} PDF${count === 1 ? "" : "s"} uploaded successfully.`;
      setFiles([]);
      setStatus("");
      onUploaded?.(message);
      onClose();
    } catch (error) {
      setStatus(error.response?.data?.message || "PDF upload failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 px-4 py-6">
      <div className="flex min-h-full items-start justify-center">
        <form
          onSubmit={handleSubmit}
          className="card-panel relative my-2 max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto p-5 sm:p-7"
        >
          <button
            type="button"
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-border bg-white text-brand-slate hover:border-brand-crimson hover:text-brand-crimson"
            onClick={onClose}
            aria-label="Close PDF uploader"
          >
            <X size={18} />
          </button>

          <div className="pr-12">
            <span className="eyebrow">Journal PDFs</span>
            <h2 className="font-display text-2xl font-semibold text-brand-ink sm:text-3xl">Add PDFs to journal</h2>
            <p className="mt-3 text-brand-slate">
              Upload one or more PDFs for <span className="font-semibold text-brand-ink">{journalName || "the selected journal"}</span>.
            </p>
          </div>

          <div className="mt-6 rounded-3xl border border-brand-border bg-brand-elevated p-5">
            <label className="form-label" data-required="true">Choose PDF files</label>
            <input
              type="file"
              accept=".pdf,application/pdf"
              multiple
              onChange={(event) => setFiles(Array.from(event.target.files || []))}
            />

            {files.length ? (
              <div className="mt-4 space-y-2">
                {files.map((file) => (
                  <div key={`${file.name}-${file.size}`} className="flex min-w-0 items-center gap-3 rounded-2xl border border-brand-border bg-white px-4 py-3 text-sm text-brand-slate">
                    <FileText size={16} className="text-brand-crimson" />
                    <span className="min-w-0 truncate">{file.name}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {status ? <p className="mt-4 text-sm text-rose-600">{status}</p> : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="submit" className="button-primary" disabled={submitting}>
              <Upload size={16} className="mr-2" />
              {submitting ? "Uploading..." : "Upload PDFs"}
            </button>
            <button type="button" className="button-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
