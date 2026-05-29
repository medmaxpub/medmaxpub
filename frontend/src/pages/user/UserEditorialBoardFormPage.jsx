import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/client";
import SectionHeader from "../../components/common/SectionHeader";
import RichTextEditor from "../../components/user/RichTextEditor";
import { initialEditorialBoardForm, mapEditorialBoardMemberToForm, stripHtml } from "../../components/user/userPortalShared";
import useManagedJournal from "../../hooks/useManagedJournal";

export default function UserEditorialBoardFormPage() {
  const navigate = useNavigate();
  const { memberId } = useParams();
  const isEditing = Boolean(memberId);
  const { journal, loading: journalLoading, error: journalError } = useManagedJournal();
  const [form, setForm] = useState(initialEditorialBoardForm);
  const [status, setStatus] = useState("");
  const [loadingMember, setLoadingMember] = useState(isEditing);

  const pageTitle = useMemo(() => (isEditing ? "Edit Editorial Board Member" : "Add Editorial Board Member"), [isEditing]);

  useEffect(() => {
    const loadMember = async () => {
      if (!memberId) {
        setLoadingMember(false);
        return;
      }

      try {
        const response = await api.get("/user/editorial-board");
        const targetMember = (response.data || []).find((item) => item.id === memberId);

        if (!targetMember) {
          setStatus("Editorial board member not found.");
          setLoadingMember(false);
          return;
        }

        setForm(mapEditorialBoardMemberToForm(targetMember));
      } catch (error) {
        setStatus(error.response?.data?.message || "Unable to load editorial board member.");
      } finally {
        setLoadingMember(false);
      }
    };

    loadMember();
  }, [memberId]);

  const submitMember = async (event) => {
    event.preventDefault();
    setStatus("");

    if (!journal?.id) {
      setStatus("This user does not have a journal assigned yet.");
      return;
    }

    if (!form.editorType || !form.name) {
      setStatus("Editor type and editor name are required.");
      return;
    }

    if (!stripHtml(form.editorDescription)) {
      setStatus("Editor description must contain content.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("journalId", journal.id);
      formData.append("editorType", form.editorType);
      formData.append("name", form.name);
      formData.append("editorDescription", form.editorDescription);
      formData.append("editorBiography", form.editorBiography);
      formData.append("profileUrl", form.profileUrl);

      if (form.profileImage) {
        formData.append("profileImage", form.profileImage);
      }

      if (isEditing) {
        await api.put(`/user/editorial-board/${memberId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else {
        await api.post("/user/editorial-board", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }

      navigate("/user/editorial-board");
    } catch (error) {
      setStatus(error.response?.data?.message || "Editorial board save failed.");
    }
  };

  if (journalLoading || loadingMember) {
    return null;
  }

  return (
    <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="card-panel p-6 sm:p-8">
        <SectionHeader label="Editorial Board" />

        <div className="mt-8 max-w-6xl">
          {journalError ? <p className="mb-6 text-sm text-brand-slate">{journalError}</p> : null}
          <div className="mb-6 flex flex-wrap gap-3">
            <button type="button" className="button-secondary px-4 py-2" onClick={() => navigate("/user/editorial-board")}>
              <ArrowLeft size={16} className="mr-2" />
              Back to Members
            </button>
          </div>

          <form onSubmit={submitMember} className="space-y-6">
            <div className="grid gap-5 lg:grid-cols-[220px_1fr] lg:items-start">
              <label className="form-side-label" data-required="true">Editor Type</label>
              <input
                value={form.editorType}
                onChange={(event) => setForm((current) => ({ ...current, editorType: event.target.value }))}
                placeholder="Editor Type"
                required
              />
            </div>

            <div className="grid gap-5 lg:grid-cols-[220px_1fr] lg:items-start">
              <label className="form-side-label" data-required="true">Editor Name</label>
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Editor Name"
                required
              />
            </div>

            <div className="grid gap-5 lg:grid-cols-[220px_1fr] lg:items-start">
              <div className="pt-3">
                <label className="text-sm font-semibold text-brand-ink">Editor Photo</label>
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setForm((current) => ({ ...current, profileImage: event.target.files?.[0] || null }))}
                />
                <p className="mt-2 text-xs text-brand-slate">Photo should be clean portrait style for best table display.</p>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[220px_1fr] lg:items-start">
              <div className="form-side-label" data-required="true">Editor Description</div>
              <RichTextEditor
                label=""
                value={form.editorDescription}
                onChange={(value) => setForm((current) => ({ ...current, editorDescription: value }))}
                required
                placeholder="Enter editor description"
              />
            </div>

            <div className="grid gap-5 lg:grid-cols-[220px_1fr] lg:items-start">
              <div className="form-side-label">Editor Biography</div>
              <RichTextEditor
                label=""
                value={form.editorBiography}
                onChange={(value) => setForm((current) => ({ ...current, editorBiography: value }))}
                placeholder="Enter editor biography"
              />
            </div>

            <div className="grid gap-5 lg:grid-cols-[220px_1fr] lg:items-start">
              <label className="form-side-label">EB Profile URL</label>
              <input
                type="url"
                value={form.profileUrl}
                onChange={(event) => setForm((current) => ({ ...current, profileUrl: event.target.value }))}
                placeholder="EB URL"
              />
            </div>

            {status ? <p className="text-sm text-brand-slate">{status}</p> : null}

            <button type="submit" className="button-primary px-5 py-3">
              <Save size={16} className="mr-2" />
              {isEditing ? "Update Member" : "Submit"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
