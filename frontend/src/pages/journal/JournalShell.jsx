import { Download, ExternalLink, FileText, PlayCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api, { shouldUseDevelopmentFallback, withFallback } from "../../api/client";
import EmptyState from "../../components/common/EmptyState";
import PptPreviewModal from "../../components/common/PptPreviewModal";
import JournalMenu from "../../components/journal/JournalMenu";
import IssueAccordion from "../../components/journal/IssueAccordion";
import { mockJournals } from "../../data/mockData";
import { normalizePptItem } from "../../utils/pptPreview";
import { normalizeVideoItem } from "../../utils/videoPlayer";

const sectionTitles = {
  about: "About Journal",
  instructions: "Journal Instructions",
  ppts: "Journal PPTs",
  videos: "Journal Videos",
  "current-issue": "Current Issue",
  archive: "Archive"
};

function renderCopyBlock(value) {
  return (
    <div className="rounded-3xl bg-slate-50 p-6 text-slate-700">
      <p className="whitespace-pre-line leading-8">{value}</p>
    </div>
  );
}

export default function JournalShell() {
  const { journalUrl, section = "about" } = useParams();
  const [journal, setJournal] = useState(null);
  const [activePreview, setActivePreview] = useState(null);
  const [activeVideoId, setActiveVideoId] = useState(null);
  const useDevelopmentFallback = shouldUseDevelopmentFallback();

  useEffect(() => {
    withFallback(
      () => api.get(`/journals/${journalUrl}`),
      useDevelopmentFallback ? mockJournals.find((item) => item.journalUrl === journalUrl) : null
    ).then(setJournal);
  }, [journalUrl, useDevelopmentFallback]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setActivePreview(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    setActiveVideoId(null);
  }, [journalUrl, section]);

  if (!journal) {
    return (
      <div className="section-shell">
        <div className="container-shell">
          <EmptyState title="Journal not found" description="The selected journal record could not be loaded." />
        </div>
      </div>
    );
  }

  const journalVideos = (journal.videos || []).map(normalizeVideoItem);
  const activeVideo = journalVideos.find((item) => item.id === activeVideoId) || journalVideos[0] || null;

  const renderCurrentIssue = () => (
    <div className="space-y-4">
      {journal.currentIssue ? (
        <>
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-sm uppercase tracking-[0.18em] text-brand-teal">Issue Information</p>
            <h3 className="mt-2 text-2xl font-semibold text-brand-navy">
              Volume {journal.currentIssue.volume}, Issue {journal.currentIssue.issue} ({journal.currentIssue.year})
            </h3>
          </div>
          {journal.currentIssue.articles.map((article) => (
            <article key={article.id} className="rounded-3xl border border-slate-200 bg-white p-5">
              <h4 className="text-xl font-semibold text-brand-navy">{article.title}</h4>
              <p className="mt-2 text-sm text-slate-500">{article.authors.join(", ")}</p>
              <div className="mt-4 flex gap-3">
                <a href={article.pdfUrl} className="button-soft px-4 py-2" target="_blank" rel="noreferrer">
                  <ExternalLink size={16} className="mr-2" />
                  View PDF
                </a>
                <a href={article.pdfUrl} className="button-primary px-4 py-2">
                  <Download size={16} className="mr-2" />
                  Download PDF
                </a>
              </div>
            </article>
          ))}
        </>
      ) : (
        <EmptyState
          title="No current issue available"
          description="Create an issue and attach articles from the admin dashboard to populate this section."
        />
      )}
    </div>
  );

  const renderSection = () => {
    if (section === "about") {
      return renderCopyBlock(journal.aboutJournal);
    }

    if (section === "instructions") {
      return renderCopyBlock(journal.journalInstructions);
    }

    if (section === "current-issue") {
      return renderCurrentIssue();
    }

    if (section === "archive") {
      return <IssueAccordion archive={journal.archive} />;
    }

    if (section === "ppts") {
      const ppts = (journal.ppts || []).map(normalizePptItem);

      if (!ppts.length) {
        return <EmptyState title="No journal PPTs available" description="This journal has not published any PPT resources yet." />;
      }

      return (
        <div className="grid gap-6 lg:grid-cols-2">
          {ppts.map((ppt) => (
            <article key={ppt.id} className="rounded-3xl border border-slate-200 bg-white p-5">
              <p className="text-sm uppercase tracking-[0.18em] text-brand-teal">
                Uploaded {new Date(ppt.uploadedDate).toLocaleDateString()}
              </p>
              <h4 className="mt-3 text-xl font-semibold text-brand-navy">{ppt.title}</h4>
              <p className="mt-3 leading-7 text-slate-600">{ppt.description}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" className="button-soft px-4 py-2" onClick={() => setActivePreview(ppt)}>
                  <ExternalLink size={16} className="mr-2" />
                  View
                </button>
                <a href={ppt.downloadUrl} target="_blank" rel="noreferrer" download className="button-primary px-4 py-2">
                  <Download size={16} className="mr-2" />
                  Download
                </a>
              </div>
            </article>
          ))}
        </div>
      );
    }

    if (section === "videos") {
      if (!journalVideos.length) {
        return <EmptyState title="No journal videos available" description="This journal has not published any video resources yet." />;
      }

      return (
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
            {activeVideo?.youtubeUrl ? (
              <iframe
                title={activeVideo.title}
                src={activeVideo.youtubeUrl}
                className="aspect-video w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : activeVideo?.videoUrl ? (
              <video controls className="aspect-video w-full" poster={activeVideo.thumbnailUrl || undefined}>
                <source src={activeVideo.videoUrl} />
              </video>
            ) : (
              <div className="flex aspect-video items-center justify-center bg-slate-100 text-sm text-slate-500">
                No embeddable media available for this video.
              </div>
            )}
            <div className="p-6">
              <h3 className="text-2xl font-semibold text-brand-navy">{activeVideo?.title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{activeVideo?.description}</p>
            </div>
          </div>

          <div className="space-y-4">
            {journalVideos.map((video) => (
              <button
                key={video.id}
                type="button"
                onClick={() => setActiveVideoId(video.id)}
                className={`flex w-full items-center gap-4 rounded-3xl border bg-white p-4 text-left transition ${
                  activeVideo?.id === video.id ? "border-brand-teal/40 ring-2 ring-brand-teal/20" : "border-slate-200"
                }`}
              >
                <div className="flex h-20 w-24 items-center justify-center rounded-2xl bg-brand-mist sm:h-24 sm:w-36">
                  {video.thumbnailUrl ? (
                    <img src={video.thumbnailUrl} alt={video.title} className="h-full w-full rounded-2xl object-cover" />
                  ) : (
                    <PlayCircle className="text-brand-teal" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-brand-navy">{video.title}</h4>
                  <p className="mt-2 text-sm text-slate-500">{video.description || "Click to play inside the embedded viewer."}</p>
                </div>
                <PlayCircle className="text-brand-teal" />
              </button>
            ))}
          </div>
        </div>
      );
    }

    return renderCopyBlock(journal.aboutJournal);
  };

  return (
    <div className="section-shell">
      <div className="container-shell">
        <div className="card-panel overflow-hidden">
          <div className="grid gap-6 px-5 py-5 sm:px-8 sm:py-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-8">
            <div className="rounded-3xl bg-brand-mist p-6">
              <p className="text-sm uppercase tracking-[0.18em] text-brand-teal">Managing Journal Name</p>
              <h1 className="mt-3 font-display text-3xl font-semibold text-brand-navy sm:text-4xl">{journal.managingJournalName}</h1>
              <p className="mt-4 text-sm text-slate-500">Managed by {journal.firstName} {journal.lastName}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 p-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-brand-gold">Journal Domain Name</p>
                  <p className="mt-2 text-lg font-semibold text-brand-ink">{journal.journalDomainName}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-brand-gold">Journal URL</p>
                  <p className="mt-2 text-lg font-semibold text-brand-ink">{journal.journalUrl}</p>
                </div>
              </div>
              {journal.pdfFileUrl ? (
                <a href={journal.pdfFileUrl} target="_blank" rel="noreferrer" className="button-secondary mt-5 inline-flex px-4 py-2">
                  <FileText size={16} className="mr-2" />
                  Open Journal PDF
                </a>
              ) : null}
            </div>
          </div>
          <div className="border-t border-slate-100 px-5 py-5 sm:px-8 sm:py-6">
            <JournalMenu journalUrl={journal.journalUrl} />
          </div>
        </div>

        <div className="mt-8 card-panel p-5 sm:p-8">
          <span className="eyebrow">{sectionTitles[section] || "Journal"}</span>
          <h2 className="font-display text-2xl font-semibold text-brand-navy sm:text-3xl">{sectionTitles[section] || "Journal Section"}</h2>
          <div className="mt-6">{renderSection()}</div>
        </div>
      </div>
      <PptPreviewModal ppt={activePreview} onClose={() => setActivePreview(null)} />
    </div>
  );
}
