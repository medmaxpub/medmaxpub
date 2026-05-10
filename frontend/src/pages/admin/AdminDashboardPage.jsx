import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api, { shouldUseDevelopmentFallback, withFallback } from "../../api/client";
import SectionHeader from "../../components/common/SectionHeader";
import { useAuth } from "../../context/AuthContext";
import { mockJournals, mockPpts, mockTestimonials, mockVideos } from "../../data/mockData";
import { normalizeVideoItem } from "../../utils/videoPlayer";

const initialJournal = {
  title: "",
  slug: "",
  issn: "",
  category: "",
  description: "",
  home: "",
  about: "",
  aimScope: "",
  editorialBoard: "",
  authorGuidelines: "",
  articleInPress: "",
  coverImage: null
};

const initialPptForm = {
  journalId: "",
  title: "",
  description: "",
  pptFile: null,
  previewFile: null
};

const initialVideoForm = {
  journalId: "",
  title: "",
  description: "",
  youtubeUrl: "",
  thumbnail: null,
  videoFile: null
};

function normalizeAdminItem(item) {
  return {
    ...item,
    id: item.id || item._id
  };
}

function mapJournalToForm(journal) {
  return {
    title: journal?.title || "",
    slug: journal?.slug || "",
    issn: journal?.issn || "",
    category: journal?.category || "",
    description: journal?.description || "",
    home: journal?.sections?.home || "",
    about: journal?.sections?.about || "",
    aimScope: journal?.sections?.aimScope || journal?.sections?.["aim-scope"] || "",
    editorialBoard: journal?.sections?.editorialBoard || journal?.sections?.["editorial-board"] || "",
    authorGuidelines: journal?.sections?.authorGuidelines || journal?.sections?.["author-guidelines"] || "",
    articleInPress: journal?.sections?.articleInPress || journal?.sections?.["article-in-press"] || "",
    coverImage: null
  };
}

export default function AdminDashboardPage() {
  const location = useLocation();
  const { user } = useAuth();
  const [journals, setJournals] = useState([]);
  const [ppts, setPpts] = useState([]);
  const [videos, setVideos] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [journalForm, setJournalForm] = useState(initialJournal);
  const [managedJournalId, setManagedJournalId] = useState("");
  const [pptForm, setPptForm] = useState(initialPptForm);
  const [videoForm, setVideoForm] = useState(initialVideoForm);
  const [status, setStatus] = useState("");
  const [pptStatus, setPptStatus] = useState("");
  const [videoStatus, setVideoStatus] = useState("");
  const isSuperAdmin = user?.role === "super_admin";
  const useDevelopmentFallback = shouldUseDevelopmentFallback();

  useEffect(() => {
    withFallback(() => api.get("/admin/journals"), useDevelopmentFallback ? mockJournals : []).then((data) =>
      setJournals(data.map(normalizeAdminItem))
    );
    withFallback(() => api.get("/admin/ppts"), useDevelopmentFallback ? mockPpts : []).then((data) =>
      setPpts(data.map(normalizeAdminItem))
    );
    withFallback(() => api.get("/admin/videos"), useDevelopmentFallback ? mockVideos : []).then((data) =>
      setVideos(data.map(normalizeVideoItem))
    );

    if (isSuperAdmin) {
      withFallback(() => api.get("/admin/contact"), []).then((data) => setContacts(data.map(normalizeAdminItem)));
      return;
    }

    setContacts([]);
  }, [isSuperAdmin, useDevelopmentFallback]);

  useEffect(() => {
    if (!journals.length) {
      return;
    }

    setPptForm((current) => ({
      ...current,
      journalId: current.journalId || journals[0].id
    }));
    setVideoForm((current) => ({
      ...current,
      journalId: current.journalId || journals[0].id
    }));
  }, [journals]);

  useEffect(() => {
    if (isSuperAdmin || !journals.length) {
      return;
    }

    const activeJournal = journals.find((journal) => journal.id === managedJournalId) || journals[0];
    setManagedJournalId(activeJournal.id);
    setJournalForm(mapJournalToForm(activeJournal));
  }, [isSuperAdmin, journals, managedJournalId]);

  useEffect(() => {
    const scrollTarget = () => {
      if (!location.hash) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const elementId = decodeURIComponent(location.hash.slice(1));
      const element = document.getElementById(elementId);

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    };

    const frameId = window.requestAnimationFrame(scrollTarget);
    return () => window.cancelAnimationFrame(frameId);
  }, [location.hash, location.pathname]);

  const submitJournal = async (event) => {
    event.preventDefault();
    const formData = new FormData();

    Object.entries(journalForm).forEach(([key, value]) => {
      if (value) {
        formData.append(key, value);
      }
    });

    try {
      const response = await api[isSuperAdmin ? "post" : "put"](isSuperAdmin ? "/journals" : `/journals/${managedJournalId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      if (isSuperAdmin) {
        setStatus(`Journal "${response.data.title}" saved successfully.`);
        setJournalForm(initialJournal);
        setJournals((current) => [normalizeAdminItem(response.data), ...current]);
      } else {
        setStatus(`Journal "${response.data.title}" updated successfully.`);
        setJournals((current) =>
          current.map((journal) => (journal.id === managedJournalId ? normalizeAdminItem({ ...journal, ...response.data }) : journal))
        );
      }
    } catch (error) {
      setStatus(error.response?.data?.message || "Journal save failed. Make sure the Express API is running and uploads are enabled.");
    }
  };

  const submitPpt = async (event) => {
    event.preventDefault();
    setPptStatus("");

    const formData = new FormData();

    Object.entries(pptForm).forEach(([key, value]) => {
      if (value) {
        formData.append(key, value);
      }
    });

    try {
      const response = await api.post(`/journals/${pptForm.journalId}/ppts`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      setPptStatus(`PPT "${response.data.title}" uploaded successfully.`);
      setPptForm({
        ...initialPptForm,
        journalId: journals[0]?.id || ""
      });
      setPpts((current) => [normalizeAdminItem(response.data), ...current]);
    } catch (error) {
      setPptStatus(error.response?.data?.message || "PPT upload failed. Make sure the selected journal is accessible.");
    }
  };

  const submitVideo = async (event) => {
    event.preventDefault();
    setVideoStatus("");

    const formData = new FormData();

    Object.entries(videoForm).forEach(([key, value]) => {
      if (value) {
        formData.append(key, value);
      }
    });

    try {
      const response = await api.post(`/journals/${videoForm.journalId}/videos`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      setVideoStatus(`Video "${response.data.title}" uploaded successfully.`);
      setVideoForm({
        ...initialVideoForm,
        journalId: journals[0]?.id || ""
      });
      setVideos((current) => [normalizeVideoItem(response.data), ...current]);
    } catch (error) {
      setVideoStatus(error.response?.data?.message || "Video upload failed. Add a YouTube URL or upload a video file for the selected journal.");
    }
  };

  return (
    <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <section id="dashboard" className="card-panel p-8">
        <SectionHeader
          label="Dashboard"
          title="Admin publishing workspace"
          description="Use these modules to manage journals, issues, articles, educational assets, and platform content."
        />
        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
          {isSuperAdmin
            ? "You are signed in as a super admin and can manage all journals, platform-wide content, and both admin scopes."
            : `You are signed in as a journal admin. Your portal is scoped to ${journals.length || 0} assigned journal${journals.length === 1 ? "" : "s"}.`}
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Journals", value: journals.length },
            { label: "PPT's", value: ppts.length },
            { label: "Videos", value: videos.length },
            { label: "Messages", value: contacts.length }
          ].map((item) => (
            <div key={item.label} className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm uppercase tracking-[0.18em] text-brand-teal">{item.label}</p>
              <p className="mt-2 text-4xl font-semibold text-brand-navy">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="journals" className="card-panel p-8">
        <SectionHeader
          label="Journal Management"
          title={isSuperAdmin ? "Add journal records" : "Manage your assigned journal"}
          description={
            isSuperAdmin
              ? "Journal covers upload as media assets while section content is saved as structured text fields for the journal detail tabs."
              : "Journal admins can update the content, branding, and sections of their own journal."
          }
        />
        <form onSubmit={submitJournal} className="mt-8 grid gap-4 sm:grid-cols-2">
          {!isSuperAdmin && journals.length > 1 ? (
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-600">Assigned Journal</label>
              <select
                value={managedJournalId}
                onChange={(event) => {
                  const nextJournal = journals.find((journal) => journal.id === event.target.value);
                  setManagedJournalId(event.target.value);
                  setJournalForm(mapJournalToForm(nextJournal));
                }}
              >
                {journals.map((journal) => (
                  <option key={journal.id} value={journal.id}>
                    {journal.title}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <input value={journalForm.title} onChange={(event) => setJournalForm({ ...journalForm, title: event.target.value })} placeholder="Journal Title" required />
          <input value={journalForm.slug} onChange={(event) => setJournalForm({ ...journalForm, slug: event.target.value })} placeholder="Slug" required />
          <input value={journalForm.issn} onChange={(event) => setJournalForm({ ...journalForm, issn: event.target.value })} placeholder="ISSN" required />
          <input value={journalForm.category} onChange={(event) => setJournalForm({ ...journalForm, category: event.target.value })} placeholder="Category" required />
          <textarea
            value={journalForm.description}
            onChange={(event) => setJournalForm({ ...journalForm, description: event.target.value })}
            placeholder="Description"
            rows="4"
            className="sm:col-span-2"
            required
          />
          <textarea
            value={journalForm.home}
            onChange={(event) => setJournalForm({ ...journalForm, home: event.target.value })}
            placeholder="Journal Home"
            rows="4"
          />
          <textarea
            value={journalForm.about}
            onChange={(event) => setJournalForm({ ...journalForm, about: event.target.value })}
            placeholder="About"
            rows="4"
          />
          <textarea
            value={journalForm.aimScope}
            onChange={(event) => setJournalForm({ ...journalForm, aimScope: event.target.value })}
            placeholder="Aim & Scope"
            rows="4"
          />
          <textarea
            value={journalForm.editorialBoard}
            onChange={(event) => setJournalForm({ ...journalForm, editorialBoard: event.target.value })}
            placeholder="Editorial Board"
            rows="4"
          />
          <textarea
            value={journalForm.authorGuidelines}
            onChange={(event) => setJournalForm({ ...journalForm, authorGuidelines: event.target.value })}
            placeholder="Author Guidelines"
            rows="4"
          />
          <textarea
            value={journalForm.articleInPress}
            onChange={(event) => setJournalForm({ ...journalForm, articleInPress: event.target.value })}
            placeholder="Article In Press"
            rows="4"
          />
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-600">Journal Cover Image</label>
            <input type="file" accept="image/*" onChange={(event) => setJournalForm({ ...journalForm, coverImage: event.target.files?.[0] || null })} />
          </div>
          <div className="sm:col-span-2 flex items-center justify-between gap-4">
            <button type="submit" className="button-primary" disabled={!isSuperAdmin && !managedJournalId}>
              {isSuperAdmin ? "Save Journal" : "Update Journal"}
            </button>
            {status ? <p className="text-sm text-slate-500">{status}</p> : null}
          </div>
        </form>
      </section>

      <section id="issues" className="card-panel p-8">
        <SectionHeader
          label="Issue & Article Management"
          title="Current issue and archive publishing"
          description="This section reflects the journals available inside the current admin portal."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {journals.length ? (
            journals.map((journal) => (
              <div key={journal.id} className="rounded-2xl border border-slate-200 p-5">
                <h3 className="font-semibold text-brand-navy">{journal.title}</h3>
                <p className="mt-2 text-sm text-slate-500">Slug: {journal.slug}</p>
                <p className="mt-2 text-sm text-slate-500">Category: {journal.category}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No journals are available in this portal yet.</p>
          )}
        </div>
      </section>

      <section id="assets" className="grid gap-8 xl:grid-cols-2">
        <div className="card-panel p-8">
          <SectionHeader
            label="PPT Upload Management"
            title="PPT assets"
            description="Upload PPTs directly into a journal. They appear inside that journal rather than as a standalone public resource."
          />
          <form onSubmit={submitPpt} className="mt-8 grid gap-4">
            <select value={pptForm.journalId} onChange={(event) => setPptForm({ ...pptForm, journalId: event.target.value })} required>
              <option value="" disabled>
                Select Journal
              </option>
              {journals.map((journal) => (
                <option key={journal.id} value={journal.id}>
                  {journal.title}
                </option>
              ))}
            </select>
            <input value={pptForm.title} onChange={(event) => setPptForm({ ...pptForm, title: event.target.value })} placeholder="PPT Title" required />
            <textarea
              value={pptForm.description}
              onChange={(event) => setPptForm({ ...pptForm, description: event.target.value })}
              placeholder="Description"
              rows="4"
              required
            />
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">PPT or PPTX File</label>
              <input
                type="file"
                accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                onChange={(event) => setPptForm({ ...pptForm, pptFile: event.target.files?.[0] || null })}
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">Preview PDF override (optional)</label>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(event) => setPptForm({ ...pptForm, previewFile: event.target.files?.[0] || null })}
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <button type="submit" className="button-primary" disabled={!journals.length}>
                Upload PPT
              </button>
              {pptStatus ? <p className="text-sm text-slate-500">{pptStatus}</p> : null}
            </div>
          </form>
          <div className="mt-8 space-y-4">
            {ppts.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                <h3 className="font-semibold text-brand-navy">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{item.journal?.title || item.journalTitle || "Unassigned journal"}</p>
                <p className="mt-2 text-sm text-slate-500">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card-panel p-8">
          <SectionHeader
            label="Video Upload Management"
            title="Journal video assets"
            description="Attach YouTube embeds or uploaded video files directly to a journal so readers watch them inside the journal experience."
          />
          <form onSubmit={submitVideo} className="mt-8 grid gap-4">
            <select value={videoForm.journalId} onChange={(event) => setVideoForm({ ...videoForm, journalId: event.target.value })} required>
              <option value="" disabled>
                Select Journal
              </option>
              {journals.map((journal) => (
                <option key={journal.id} value={journal.id}>
                  {journal.title}
                </option>
              ))}
            </select>
            <input value={videoForm.title} onChange={(event) => setVideoForm({ ...videoForm, title: event.target.value })} placeholder="Video Title" required />
            <textarea
              value={videoForm.description}
              onChange={(event) => setVideoForm({ ...videoForm, description: event.target.value })}
              placeholder="Description"
              rows="4"
              required
            />
            <input
              value={videoForm.youtubeUrl}
              onChange={(event) => setVideoForm({ ...videoForm, youtubeUrl: event.target.value })}
              placeholder="YouTube embed URL (optional if uploading a video file)"
            />
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">Thumbnail Image (optional)</label>
              <input type="file" accept="image/*" onChange={(event) => setVideoForm({ ...videoForm, thumbnail: event.target.files?.[0] || null })} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">Video File (optional if using YouTube)</label>
              <input type="file" accept="video/*" onChange={(event) => setVideoForm({ ...videoForm, videoFile: event.target.files?.[0] || null })} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <button type="submit" className="button-primary" disabled={!journals.length}>
                Upload Video
              </button>
              {videoStatus ? <p className="text-sm text-slate-500">{videoStatus}</p> : null}
            </div>
          </form>
          <div className="mt-8 space-y-4">
            {videos.map((video) => (
              <div key={video.id} className="rounded-2xl border border-slate-200 p-4">
                <h3 className="font-semibold text-brand-navy">{video.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{video.journalTitle || "Unassigned journal"}</p>
                <p className="mt-2 text-sm text-slate-500">{video.description || "Embedded journal video resource."}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {isSuperAdmin ? (
        <section id="videos" className="grid gap-8">
          <div className="card-panel p-8">
            <SectionHeader
              label="Testimonials"
              title="Homepage social proof"
              description="Testimonials are short content records that can be managed independently of journals."
            />
            <div className="mt-8 space-y-4">
              {mockTestimonials.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                  <h3 className="font-semibold text-brand-navy">{item.name}</h3>
                  <p className="mt-2 text-sm text-slate-500">{item.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {isSuperAdmin ? (
        <section id="contacts" className="card-panel p-8">
          <SectionHeader
            label="Contact Messages"
            title="Inbox viewer"
            description="Messages submitted from the public contact page are stored in MongoDB and displayed here."
          />
          <div className="mt-8">
            {contacts.length ? (
              <div className="space-y-4">
                {contacts.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                    <h3 className="font-semibold text-brand-navy">{item.subject}</h3>
                    <p className="mt-2 text-sm text-slate-500">
                      {item.name} - {item.email}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No contact messages are loaded yet.</p>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
