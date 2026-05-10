import { Download, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import api, { withFallback } from "../../api/client";
import PptPreviewModal from "../../components/common/PptPreviewModal";
import SectionHeader from "../../components/common/SectionHeader";
import { mockPpts } from "../../data/mockData";
import { normalizePptItem } from "../../utils/pptPreview";

export default function PptsPage() {
  const [items, setItems] = useState([]);
  const [activePreview, setActivePreview] = useState(null);

  useEffect(() => {
    withFallback(() => api.get("/ppts"), mockPpts).then((data) => {
      const normalized = data.map(normalizePptItem);
      setItems(normalized);
    });
  }, []);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setActivePreview(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <div className="section-shell">
      <div className="container-shell">
        <SectionHeader
          label="PPTs"
          title="Presentation resources with preview and download actions"
          description="View opens an in-page popup. For the slide-style viewer, upload a preview PDF from the admin portal."
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {items.map((ppt) => (
            <article key={ppt.id} className="card-panel p-8">
              <p className="text-sm uppercase tracking-[0.18em] text-brand-teal">
                Uploaded {new Date(ppt.uploadedDate).toLocaleDateString()}
              </p>
              {ppt.journalTitle ? <p className="mt-2 text-sm font-medium text-slate-500">{ppt.journalTitle}</p> : null}
              <h3 className="mt-3 font-display text-2xl font-semibold text-brand-navy">{ppt.title}</h3>
              <p className="mt-4 leading-7 text-slate-600">{ppt.description}</p>
              <div className="mt-6 flex gap-3">
                <button type="button" className="button-soft px-4 py-2" onClick={() => setActivePreview(ppt)}>
                  <Eye size={16} className="mr-2" />
                  View
                </button>
                <a href={ppt.fileUrl} className="button-primary px-4 py-2">
                  <Download size={16} className="mr-2" />
                  Download
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>

      <PptPreviewModal ppt={activePreview} onClose={() => setActivePreview(null)} />
    </div>
  );
}
