import { ExternalLink, FileVideo, Pencil, Plus, Presentation, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import SectionHeader from "../common/SectionHeader";
import api from "../../api/client";

const initialPptForm = {
  journalId: "",
  title: "",
  authorName: "",
  doiNumber: "",
  coverImage: null,
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

function formatPptDate(value) {
  if (!value) {
    return "NA";
  }

  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return "NA";
  }
}

function buildPptDescription({ title, authorName, doiNumber }) {
  return [authorName, doiNumber].filter(Boolean).join(" | ") || title;
}

function mapPptToForm(ppt) {
  return {
    journalId: ppt?.journal?._id || ppt?.journal?.id || ppt?.journal || "",
    title: ppt?.title || "",
    authorName: ppt?.authorName || "",
    doiNumber: ppt?.doiNumber || "",
    coverImage: null,
    pptFile: null
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
  const [editingPptId, setEditingPptId] = useState("");
  const [showPptForm, setShowPptForm] = useState(false);

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
  const isEditingPpt = Boolean(editingPptId);

  const resetPptEditor = () => {
    setPptForm(initialPptForm);
    setEditingPptId("");
    setShowPptForm(false);
  };

  const openCreatePpt = () => {
    setPptStatus("");
    setEditingPptId("");
    setPptForm(initialPptForm);
    setShowPptForm(true);
  };

  const openEditPpt = (ppt) => {
    setPptStatus("");
    setEditingPptId(ppt.id);
    setPptForm(mapPptToForm(ppt));
    setShowPptForm(true);
  };

  const submitPpt = async (event) => {
    event.preventDefault();
    setPptStatus("");

    if (!pptForm.journalId || !pptForm.title || !pptForm.authorName) {
      setPptStatus("Journal, PPT title, and author name are required.");
      return;
    }

    if (!isEditingPpt && !pptForm.pptFile) {
      setPptStatus("Please choose a PPT or PPTX file before uploading.");
      return;
    }

    if (!isEditingPpt && !pptForm.coverImage) {
      setPptStatus("Please choose a PPT cover image before uploading.");
      return;
    }

    setIsSavingPpt(true);

    try {
      const payload = new FormData();
      payload.append("journalId", pptForm.journalId);
      payload.append("title", pptForm.title);
      payload.append("description", buildPptDescription(pptForm));
      payload.append("authorName", pptForm.authorName);
      payload.append("doiNumber", pptForm.doiNumber);

      if (pptForm.coverImage) {
        payload.append("coverImage", pptForm.coverImage);
      }

      if (pptForm.pptFile) {
        payload.append("pptFile", pptForm.pptFile);
      }

      if (isEditingPpt) {
        await api.put(`/ppts/${editingPptId}`, payload);
        setPptStatus("PPT updated successfully.");
      } else {
        await api.post(`/journals/${pptForm.journalId}/ppts`, payload);
        setPptStatus("PPT uploaded successfully.");
      }

      setPptForm(initialPptForm);
      setEditingPptId("");
      setShowPptForm(false);
      await onUploaded?.();
    } catch (error) {
      setPptStatus(error.response?.data?.message || (isEditingPpt ? "PPT update failed." : "PPT upload failed."));
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

      if (editingPptId === ppt.id) {
        resetPptEditor();
      }

      await onUploaded?.();
    } catch (error) {
      setPptStatus(error.response?.data?.message || "Unable to delete PPT.");
    } finally {
      setDeletingPptId("");
    }
  };

  return (
    <section className="card-panel p-6 sm:p-8">
      <SectionHeader label={headingLabel} title={headingTitle} description={headingDescription} />

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
          <div className="rounded-3xl border border-brand-border bg-brand-elevated p-6 xl:col-span-full">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Presentation size={18} className="text-brand-crimson" />
                <div>
                  <h3 className="text-2xl font-semibold text-brand-ink">PPT Records</h3>
                  <p className="mt-1 text-sm text-brand-slate">View all PPTs row wise and use the actions to add, edit, or delete records.</p>
                </div>
              </div>

              <button type="button" className="button-primary px-4 py-2" onClick={openCreatePpt} disabled={!journalOptions.length}>
                <Plus size={16} className="mr-2" />
                Add PPT
              </button>
            </div>

            {showPptForm ? (
              <div className="mt-6 rounded-3xl border border-brand-border bg-white p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-brand-teal">{isEditingPpt ? "Edit PPT" : "Add PPT"}</p>
                    <h4 className="mt-2 text-xl font-semibold text-brand-ink">{isEditingPpt ? "Update PPT details" : "Create a new PPT record"}</h4>
                  </div>
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-border text-brand-slate transition hover:border-brand-crimson hover:text-brand-crimson"
                    onClick={resetPptEditor}
                    aria-label="Close PPT form"
                  >
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={submitPpt} className="mt-6 grid gap-4 lg:grid-cols-2">
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
                    <label className="form-label" data-required={!isEditingPpt}>PPT Cover Image</label>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={(event) => setPptForm((current) => ({ ...current, coverImage: event.target.files?.[0] || null }))}
                      required={!isEditingPpt}
                    />
                    <p className="mt-2 text-xs text-brand-slate">{isEditingPpt ? "Upload only if you want to replace the current cover image." : "Upload a cover image that will appear on the public PPT listing."}</p>
                  </div>
                  <div>
                    <label className="form-label" data-required={!isEditingPpt}>PPT Attached File</label>
                    <input
                      type="file"
                      accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                      onChange={(event) => setPptForm((current) => ({ ...current, pptFile: event.target.files?.[0] || null }))}
                      required={!isEditingPpt}
                    />
                    <p className="mt-2 text-xs text-brand-slate">{isEditingPpt ? "Upload only if you want to replace the PPT file." : "DOI is optional. Maximum PPT upload size: 100 MB."}</p>
                  </div>
                  <div className="lg:col-span-2 flex flex-wrap gap-3 pt-2">
                    <button type="submit" className="button-primary px-4 py-2" disabled={isSavingPpt || !journalOptions.length}>
                      {isSavingPpt ? (isEditingPpt ? "Updating..." : "Uploading...") : isEditingPpt ? "Update PPT" : "Save PPT"}
                    </button>
                    <button type="button" className="button-secondary px-4 py-2" onClick={resetPptEditor}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : null}

            {pptStatus ? <p className="mt-4 text-sm text-brand-slate">{pptStatus}</p> : null}

            <div className="mt-6 overflow-hidden rounded-3xl border border-brand-border bg-white">
              <div className="flex items-center justify-between gap-3 border-b border-brand-border bg-brand-surface px-5 py-4">
                <h4 className="text-lg font-semibold text-brand-ink">Uploaded PPTs</h4>
                <p className="text-sm text-brand-slate">{pptItems.length} records</p>
              </div>

              {pptItems.length ? (
                <div className="responsive-table-shell">
                  <table className="responsive-table responsive-table-wide text-left">
                    <thead className="bg-brand-elevated text-brand-ink">
                      <tr className="border-b border-brand-border">
                        <th className="px-4 py-4 font-semibold">S.No</th>
                        <th className="px-4 py-4 font-semibold">PPT Title</th>
                        <th className="px-4 py-4 font-semibold">Journal</th>
                        <th className="px-4 py-4 font-semibold">Author</th>
                        <th className="px-4 py-4 font-semibold">DOI</th>
                        <th className="px-4 py-4 font-semibold">Uploaded Date</th>
                        <th className="px-4 py-4 font-semibold">Files</th>
                        <th className="px-4 py-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pptItems.map((ppt, index) => (
                        <tr key={ppt.id} className="border-b border-brand-border/60 text-brand-slate">
                          <td className="px-4 py-4">{index + 1}</td>
                          <td className="px-4 py-4 font-medium text-brand-ink">{ppt.title || "Untitled PPT"}</td>
                          <td className="px-4 py-4">{ppt.journal?.managingJournalName || "Journal unavailable"}</td>
                          <td className="px-4 py-4">{ppt.authorName || "NA"}</td>
                          <td className="px-4 py-4">{ppt.doiNumber || "NA"}</td>
                          <td className="px-4 py-4">{formatPptDate(ppt.uploadedDate || ppt.createdAt)}</td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-2">
                              {ppt.previewPdfUrl ? (
                                <a href={ppt.previewPdfUrl} target="_blank" rel="noreferrer" className="button-secondary min-h-10 px-3 py-2">
                                  <ExternalLink size={16} className="mr-2" />
                                  Preview
                                </a>
                              ) : null}
                              {ppt.pptFileUrl ? (
                                <a href={ppt.pptFileUrl} target="_blank" rel="noreferrer" className="button-soft min-h-10 px-3 py-2">
                                  <ExternalLink size={16} className="mr-2" />
                                  PPT File
                                </a>
                              ) : null}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-2">
                              <button type="button" className="button-soft min-h-10 px-3 py-2" onClick={() => openEditPpt(ppt)}>
                                <Pencil size={16} className="mr-2" />
                                Edit
                              </button>
                              <button
                                type="button"
                                className="button-secondary min-h-10 px-3 py-2 text-rose-300"
                                onClick={() => deletePptItem(ppt)}
                                disabled={deletingPptId === ppt.id}
                              >
                                <Trash2 size={16} className="mr-2" />
                                {deletingPptId === ppt.id ? "Deleting..." : "Delete"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="px-5 py-5 text-sm text-brand-slate">No PPT records uploaded yet.</p>
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
