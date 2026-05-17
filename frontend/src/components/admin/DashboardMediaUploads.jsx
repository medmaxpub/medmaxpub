import { ExternalLink, FileVideo, Presentation, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import SectionHeader from "../common/SectionHeader";
import api from "../../api/client";

const initialPptForm = {
  journalId: "",
  title: "",
  authorName: "",
  doiNumber: "",
  pptFile: null
};

const initialVideoForm = {
  journalId: "",
  title: "",
  authorName: "",
  doiNumber: "",
  videoFile: null
};

function normalizeJournalOption(journal) {
  return {
    id: journal.id || journal._id || "",
    title: journal.managingJournalName || journal.journalTitle || "Untitled journal"
  };
}

export default function DashboardMediaUploads({
  journals = [],
  ppts = [],
  onUploaded = null,
  showSubmission = true,
  showPpt = true,
  showVideo = true,
  headingLabel = "Media Uploads",
  headingTitle = "Online submission, PPT, and video options",
  headingDescription = "Use the online submission shortcut or upload journal-linked PPT and video records with journal title, author name, DOI, and attached files."
}) {
  const [pptForm, setPptForm] = useState(initialPptForm);
  const [videoForm, setVideoForm] = useState(initialVideoForm);
  const [pptStatus, setPptStatus] = useState("");
  const [videoStatus, setVideoStatus] = useState("");
  const [isSavingPpt, setIsSavingPpt] = useState(false);
  const [isSavingVideo, setIsSavingVideo] = useState(false);
  const [deletingPptId, setDeletingPptId] = useState("");

  const journalOptions = useMemo(
    () =>
      journals
        .map(normalizeJournalOption)
        .filter((journal) => journal.id)
        .sort((left, right) => left.title.localeCompare(right.title)),
    [journals]
  );
  const visibleSectionsCount = [showSubmission, showPpt, showVideo].filter(Boolean).length;
  const gridClassName =
    visibleSectionsCount === 1 ? "xl:grid-cols-1" : visibleSectionsCount === 2 ? "xl:grid-cols-2" : "xl:grid-cols-3";
  const pptItems = Array.isArray(ppts) ? ppts : [];

  const submitPpt = async (event) => {
    event.preventDefault();
    setPptStatus("");

    if (!pptForm.pptFile) {
      setPptStatus("Please choose a PPT or PPTX file before uploading.");
      return;
    }

    setIsSavingPpt(true);

    try {
      const payload = new FormData();
      const mediaDescription = [pptForm.authorName, pptForm.doiNumber].filter(Boolean).join(" | ");
      payload.append("title", pptForm.title);
      payload.append("description", mediaDescription || pptForm.title);
      payload.append("authorName", pptForm.authorName);
      payload.append("doiNumber", pptForm.doiNumber);
      payload.append("pptFile", pptForm.pptFile);

      await api.post(`/journals/${pptForm.journalId}/ppts`, payload);

      setPptStatus("PPT uploaded successfully.");
      setPptForm(initialPptForm);
      await onUploaded?.();
    } catch (error) {
      setPptStatus(error.response?.data?.message || "PPT upload failed.");
    } finally {
      setIsSavingPpt(false);
    }
  };

  const submitVideo = async (event) => {
    event.preventDefault();
    setVideoStatus("");

    if (!videoForm.videoFile) {
      setVideoStatus("Please choose a video file before uploading.");
      return;
    }

    setIsSavingVideo(true);

    try {
      const payload = new FormData();
      payload.append("title", videoForm.title);
      payload.append("description", `${videoForm.authorName} | ${videoForm.doiNumber}`);
      payload.append("authorName", videoForm.authorName);
      payload.append("doiNumber", videoForm.doiNumber);
      payload.append("videoFile", videoForm.videoFile);

      await api.post(`/journals/${videoForm.journalId}/videos`, payload);

      setVideoStatus("Video uploaded successfully.");
      setVideoForm(initialVideoForm);
      await onUploaded?.();
    } catch (error) {
      setVideoStatus(error.response?.data?.message || "Video upload failed.");
    } finally {
      setIsSavingVideo(false);
    }
  };

  const deletePptItem = async (ppt) => {
    if (!ppt?.id) {
      return;
    }

    const confirmed = window.confirm(`Delete PPT "${ppt.title || "Untitled PPT"}"?`);

    if (!confirmed) {
      return;
    }

    setPptStatus("");
    setDeletingPptId(ppt.id);

    try {
      await api.delete(`/ppts/${ppt.id}`);
      setPptStatus("PPT deleted successfully.");
      await onUploaded?.();
    } catch (error) {
      setPptStatus(error.response?.data?.message || "Unable to delete PPT.");
    } finally {
      setDeletingPptId("");
    }
  };

  return (
    <section className="card-panel p-6 sm:p-8">
      <SectionHeader
        label={headingLabel}
        title={headingTitle}
        description={headingDescription}
      />

      <div className={`mt-8 grid gap-8 ${gridClassName}`}>
        {showSubmission ? (
        <div className="rounded-3xl border border-brand-border bg-brand-elevated p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-brand-gold">Online Submission</p>
          <h3 className="mt-3 text-2xl font-semibold text-brand-ink">Open manuscript form</h3>
          <p className="mt-3 text-sm leading-7 text-brand-slate">
            Launch the public online submission page in a new tab whenever you need to review or share the submission workflow.
          </p>
          <a href="/submit-manuscript" target="_blank" rel="noreferrer" className="button-primary mt-6 px-4 py-2">
            <ExternalLink size={16} className="mr-2" />
            Open Submission
          </a>
        </div>
        ) : null}

        {showPpt ? (
        <div className="rounded-3xl border border-brand-border bg-brand-elevated p-6">
          <div className="flex items-center gap-3">
            <Presentation size={18} className="text-brand-crimson" />
            <h3 className="text-2xl font-semibold text-brand-ink">PPT Upload</h3>
          </div>

          <form onSubmit={submitPpt} className="mt-6 grid gap-4">
            <div>
              <label className="form-label" data-required="true">Journal Title</label>
              <select value={pptForm.journalId} onChange={(event) => setPptForm((current) => ({ ...current, journalId: event.target.value }))} required>
                <option value="">Select journal</option>
                {journalOptions.map((journal) => (
                  <option key={journal.id} value={journal.id}>
                    {journal.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label" data-required="true">PPT Title</label>
              <input
                value={pptForm.title}
                onChange={(event) => setPptForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Enter PPT title"
                required
              />
            </div>
            <div>
              <label className="form-label" data-required="true">Author Name</label>
              <input
                value={pptForm.authorName}
                onChange={(event) => setPptForm((current) => ({ ...current, authorName: event.target.value }))}
                placeholder="Enter author name"
                required
              />
            </div>
            <div>
              <label className="form-label">DOI</label>
              <input
                value={pptForm.doiNumber}
                onChange={(event) => setPptForm((current) => ({ ...current, doiNumber: event.target.value }))}
                placeholder="Enter DOI (optional)"
              />
            </div>
            <div>
              <label className="form-label" data-required="true">PPT Attached File</label>
              <input
                type="file"
                accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                onChange={(event) => setPptForm((current) => ({ ...current, pptFile: event.target.files?.[0] || null }))}
                required
              />
              <p className="mt-2 text-xs text-brand-slate">DOI is optional. Maximum PPT upload size: 100 MB.</p>
            </div>
            <button type="submit" className="button-primary" disabled={isSavingPpt || !journalOptions.length}>
              {isSavingPpt ? "Uploading..." : "Upload PPT"}
            </button>
            {pptStatus ? <p className="text-sm text-brand-slate">{pptStatus}</p> : null}
          </form>

          <div className="mt-8 border-t border-brand-border pt-6">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-lg font-semibold text-brand-ink">Uploaded PPTs</h4>
              <p className="text-sm text-brand-slate">{pptItems.length} records</p>
            </div>

            {pptItems.length ? (
              <div className="mt-4 space-y-3">
                {pptItems.map((ppt) => (
                  <div key={ppt.id} className="rounded-2xl border border-brand-border bg-white p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-semibold text-brand-ink">{ppt.title || "Untitled PPT"}</p>
                        <p className="mt-1 text-sm text-brand-slate">{ppt.authorName || "Author not provided"}</p>
                        <p className="mt-1 text-xs text-brand-slate">
                          {ppt.journal?.managingJournalName || "Journal unavailable"} · {new Date(ppt.uploadedDate || ppt.createdAt || Date.now()).toLocaleDateString()}
                        </p>
                      </div>

                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={() => deletePptItem(ppt)}
                        disabled={deletingPptId === ppt.id}
                      >
                        <Trash2 size={16} className="mr-2" />
                        {deletingPptId === ppt.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-brand-slate">No PPT records uploaded yet.</p>
            )}
          </div>
        </div>
        ) : null}

        {showVideo ? (
        <div className="rounded-3xl border border-brand-border bg-brand-elevated p-6">
          <div className="flex items-center gap-3">
            <FileVideo size={18} className="text-brand-crimson" />
            <h3 className="text-2xl font-semibold text-brand-ink">Video Upload</h3>
          </div>

          <form onSubmit={submitVideo} className="mt-6 grid gap-4">
            <div>
              <label className="form-label" data-required="true">Journal Title</label>
              <select value={videoForm.journalId} onChange={(event) => setVideoForm((current) => ({ ...current, journalId: event.target.value }))} required>
                <option value="">Select journal</option>
                {journalOptions.map((journal) => (
                  <option key={journal.id} value={journal.id}>
                    {journal.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label" data-required="true">Video Title</label>
              <input
                value={videoForm.title}
                onChange={(event) => setVideoForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Enter video title"
                required
              />
            </div>
            <div>
              <label className="form-label" data-required="true">Author Name</label>
              <input
                value={videoForm.authorName}
                onChange={(event) => setVideoForm((current) => ({ ...current, authorName: event.target.value }))}
                placeholder="Enter author name"
                required
              />
            </div>
            <div>
              <label className="form-label" data-required="true">DOI</label>
              <input
                value={videoForm.doiNumber}
                onChange={(event) => setVideoForm((current) => ({ ...current, doiNumber: event.target.value }))}
                placeholder="Enter DOI"
                required
              />
            </div>
            <div>
              <label className="form-label" data-required="true">Video Attached File</label>
              <input
                type="file"
                accept="video/*"
                onChange={(event) => setVideoForm((current) => ({ ...current, videoFile: event.target.files?.[0] || null }))}
                required
              />
            </div>
            <button type="submit" className="button-primary" disabled={isSavingVideo || !journalOptions.length}>
              {isSavingVideo ? "Uploading..." : "Upload Video"}
            </button>
            {videoStatus ? <p className="text-sm text-brand-slate">{videoStatus}</p> : null}
          </form>
        </div>
        ) : null}
      </div>
    </section>
  );
}
