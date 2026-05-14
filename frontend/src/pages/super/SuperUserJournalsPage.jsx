import { ExternalLink, Pencil, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import api, { shouldUseDevelopmentFallback, withFallback } from "../../api/client";
import EmptyState from "../../components/common/EmptyState";
import SectionHeader from "../../components/common/SectionHeader";
import JournalEditorModal from "../../components/super/JournalEditorModal";
import useAutoRefresh from "../../hooks/useAutoRefresh";
import { getSuperUserJournalsFallback } from "./superUserFallbacks";
import { initialJournalForm, mapJournalToForm, normalizeItem } from "../../components/super/superUserShared";
import { buildJournalSectionPath } from "../../utils/journalLinks";

export default function SuperUserJournalsPage() {
  const [journals, setJournals] = useState([]);
  const [query, setQuery] = useState("");
  const [editingJournalId, setEditingJournalId] = useState("");
  const [journalForm, setJournalForm] = useState(initialJournalForm);
  const [journalEditorOpen, setJournalEditorOpen] = useState(false);
  const [journalStatus, setJournalStatus] = useState("");
  const useDevelopmentFallback = shouldUseDevelopmentFallback();

  const loadJournals = useCallback(async () => {
    const data = await withFallback(() => api.get("/admin/journals"), useDevelopmentFallback ? getSuperUserJournalsFallback() : []);
    setJournals(data.map(normalizeItem));
  }, [useDevelopmentFallback]);

  useEffect(() => {
    loadJournals();
  }, [loadJournals]);

  useAutoRefresh(loadJournals, { intervalMs: 15000 });

  const filteredJournals = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return journals;
    }

    return journals.filter((journal) =>
      [journal.managingJournalName, journal.journalDomainName, journal.journalUrl, journal.ownerUsername]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery))
    );
  }, [journals, query]);

  const openEditJournalEditor = (journal) => {
    setEditingJournalId(journal.id);
    setJournalForm(mapJournalToForm(journal));
    setJournalEditorOpen(true);
    setJournalStatus("");
  };

  const attachJournalMedia = async (journalId) => {
    const messages = [];

    if (journalForm.pptFile) {
      const pptData = new FormData();
      pptData.append("title", `${journalForm.managingJournalName} PPT`);
      pptData.append("description", journalForm.aboutJournal);
      pptData.append("pptFile", journalForm.pptFile);
      await api.post(`/journals/${journalId}/ppts`, pptData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      messages.push("PPT uploaded.");
    }

    if (journalForm.pdfFile) {
      const pdfData = new FormData();
      pdfData.append("pdfFile", journalForm.pdfFile);
      await api.post(`/journals/${journalId}/pdf`, pdfData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      messages.push("PDF uploaded.");
    }

    if (journalForm.videoFile) {
      const videoData = new FormData();
      videoData.append("title", `${journalForm.managingJournalName} Video`);
      videoData.append("description", journalForm.aboutJournal);
      videoData.append("videoFile", journalForm.videoFile);
      await api.post(`/journals/${journalId}/videos`, videoData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      messages.push("Video uploaded.");
    }

    return messages;
  };

  const submitJournal = async (event) => {
    event.preventDefault();
    setJournalStatus("");

    try {
      const payload = {
        firstName: journalForm.firstName,
        lastName: journalForm.lastName,
        username: journalForm.username,
        password: journalForm.password,
        managingJournalName: journalForm.managingJournalName,
        journalDomainName: journalForm.journalDomainName,
        journalUrl: journalForm.journalUrl,
        aboutJournal: journalForm.aboutJournal,
        journalInstructions: journalForm.journalInstructions
      };

      const response = await api.put(`/journals/${editingJournalId}`, payload);
      const savedJournal = normalizeItem(response.data);
      const mediaMessages = await attachJournalMedia(savedJournal.id).catch((error) => [
        `Media upload warning: ${error.response?.data?.message || error.message}`
      ]);

      setJournalStatus(`Journal updated successfully. ${mediaMessages.join(" ")}`.trim());
      setJournalEditorOpen(false);
      setEditingJournalId("");
      setJournalForm(initialJournalForm);
      await loadJournals();
    } catch (error) {
      setJournalStatus(error.response?.data?.message || "Journal save failed.");
    }
  };

  const deleteJournal = async (journal) => {
    setJournalStatus("");
    const confirmed = window.confirm(`Delete journal "${journal.managingJournalName}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/journals/${journal.id}`);
      setJournalStatus(`Journal "${journal.managingJournalName}" deleted successfully.`);
      await loadJournals();
    } catch (error) {
      setJournalStatus(error.response?.data?.message || "Journal delete failed.");
    }
  };

  return (
    <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="card-panel p-6 sm:p-8">
        <SectionHeader
          label="Journals"
          title="All journals list"
          description="Browse every journal record, search the listing, and use the row actions to view, edit, or delete journal entries."
        />

        <div className="mt-8 rounded-3xl border border-brand-border bg-brand-elevated p-4 sm:p-5">
          <div className="relative">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-slate" />
            <input
              className="pl-11"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search journal name, domain, URL, or owner"
            />
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-brand-border bg-brand-surface">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-brand-elevated text-brand-ink">
                <tr className="border-b border-brand-border">
                  <th className="px-4 py-4 font-semibold">S.No</th>
                  <th className="px-4 py-4 font-semibold">Managing Journal Name</th>
                  <th className="px-4 py-4 font-semibold">Journal Domain Name</th>
                  <th className="px-4 py-4 font-semibold">Journal URL</th>
                  <th className="px-4 py-4 font-semibold">Owner</th>
                  <th className="px-4 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJournals.length ? (
                  filteredJournals.map((journal, index) => (
                    <tr key={journal.id} className="border-b border-brand-border/60 text-brand-slate">
                      <td className="px-4 py-4">{index + 1}</td>
                      <td className="px-4 py-4 font-medium text-brand-ink">{journal.managingJournalName}</td>
                      <td className="px-4 py-4">{journal.journalDomainName}</td>
                      <td className="px-4 py-4">{journal.journalUrl}</td>
                      <td className="px-4 py-4">
                        {journal.firstName} {journal.lastName}
                        {journal.ownerUsername ? <span className="ml-2 text-xs">@{journal.ownerUsername}</span> : null}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <a
                            href={buildJournalSectionPath(journal.publicJournalUrl || journal.journalUrl, "home")}
                            className="button-secondary min-h-10 px-3 py-2"
                            target="_blank"
                            rel="noreferrer"
                          >
                            <ExternalLink size={16} className="mr-2" />
                            View
                          </a>
                          <button type="button" className="button-soft min-h-10 px-3 py-2" onClick={() => openEditJournalEditor(journal)}>
                            <Pencil size={16} className="mr-2" />
                            Edit
                          </button>
                          <button type="button" className="button-secondary min-h-10 px-3 py-2 text-rose-300" onClick={() => deleteJournal(journal)}>
                            <Trash2 size={16} className="mr-2" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-10">
                      <EmptyState title="No journals matched this search" description="Try a broader journal title, domain name, or URL." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {journalStatus ? <p className="text-sm text-brand-slate">{journalStatus}</p> : null}
      </section>

      <JournalEditorModal
        open={journalEditorOpen}
        modeLabel="Edit journal"
        form={journalForm}
        setForm={setJournalForm}
        status={journalStatus}
        onSubmit={submitJournal}
        onClose={() => {
          setJournalEditorOpen(false);
          setEditingJournalId("");
          setJournalForm(initialJournalForm);
        }}
      />
    </div>
  );
}
