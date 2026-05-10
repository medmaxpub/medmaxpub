import { useEffect, useState } from "react";
import api, { shouldUseDevelopmentFallback, withFallback } from "../../api/client";
import SectionHeader from "../../components/common/SectionHeader";
import { mockJournals } from "../../data/mockData";

const initialForm = {
  authorName: "",
  email: "",
  phone: "",
  journalId: "",
  manuscriptTitle: "",
  message: "",
  manuscriptFile: null
};

export default function SubmitManuscriptPage() {
  const [journals, setJournals] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("");
  const useDevelopmentFallback = shouldUseDevelopmentFallback();

  useEffect(() => {
    withFallback(() => api.get("/journals"), useDevelopmentFallback ? mockJournals : []).then((data) => {
      setJournals(data);
      setForm((current) => ({ ...current, journalId: data[0]?.id || "" }));
    });
  }, [useDevelopmentFallback]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (value) {
        formData.append(key, value);
      }
    });

    try {
      await api.post("/manuscripts/submit", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      setStatus("Manuscript submitted successfully.");
      setForm(initialForm);
    } catch (error) {
      setStatus("The form is ready, but the backend must be running to accept manuscript uploads.");
    }
  };

  return (
    <div className="section-shell">
      <div className="container-shell">
        <form onSubmit={handleSubmit} className="card-panel mx-auto max-w-5xl p-8">
          <SectionHeader
            label="Submit Manuscript"
            title="Author submission workflow"
            description="Authors can upload manuscript files, choose a journal and include notes for the editorial team."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <input
              value={form.authorName}
              onChange={(event) => setForm({ ...form, authorName: event.target.value })}
              placeholder="Author Name"
              required
            />
            <input
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="Email"
              type="email"
              required
            />
            <input
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
              placeholder="Phone"
              required
            />
            <select value={form.journalId} onChange={(event) => setForm({ ...form, journalId: event.target.value })} required>
              {journals.map((journal) => (
                <option key={journal.id} value={journal.id}>
                  {journal.title}
                </option>
              ))}
            </select>
            <input
              value={form.manuscriptTitle}
              onChange={(event) => setForm({ ...form, manuscriptTitle: event.target.value })}
              placeholder="Manuscript Title"
              className="sm:col-span-2"
              required
            />
            <textarea
              value={form.message}
              onChange={(event) => setForm({ ...form, message: event.target.value })}
              placeholder="Message / comments"
              rows="6"
              className="sm:col-span-2"
            />
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-600">Upload manuscript file (PDF/DOC/DOCX)</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(event) => setForm({ ...form, manuscriptFile: event.target.files?.[0] || null })}
                required
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
            <button type="submit" className="button-primary">
              Submit Manuscript
            </button>
            {status ? <p className="text-sm text-slate-500">{status}</p> : null}
          </div>
        </form>
      </div>
    </div>
  );
}
