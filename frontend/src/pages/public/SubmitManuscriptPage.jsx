import { useCallback, useEffect, useMemo, useState } from "react";
import api, { cachedGet, shouldUseDevelopmentFallback, withFallback } from "../../api/client";
import SectionHeader from "../../components/common/SectionHeader";
import { mockJournals } from "../../data/mockData";

const countries = [
  "United States",
  "India",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "United Arab Emirates",
  "Singapore",
  "South Africa"
];

const initialForm = {
  name: "",
  email: "",
  postalAddress: "",
  country: "",
  journalId: "",
  articleType: "",
  manuscriptTitle: "",
  abstract: "",
  files: []
};

export default function SubmitManuscriptPage() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("");
  const [journals, setJournals] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const useDevelopmentFallback = shouldUseDevelopmentFallback();

  const loadJournals = useCallback(() => {
    return withFallback(() => cachedGet("/journals"), useDevelopmentFallback ? mockJournals : []).then((data) => {
      setJournals(Array.isArray(data) ? data : []);
    });
  }, [useDevelopmentFallback]);

  useEffect(() => {
    loadJournals();
  }, [loadJournals]);

  const journalOptions = useMemo(
    () =>
      journals.map((journal) => ({
        value: journal.id || journal._id || "",
        label: journal.managingJournalName || "Untitled journal"
      })),
    [journals]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("");
    setIsSaving(true);

    try {
      const payload = new FormData();
      payload.append("name", form.name);
      payload.append("email", form.email);
      payload.append("postalAddress", form.postalAddress);
      payload.append("country", form.country);
      payload.append("journalId", form.journalId);
      payload.append("articleType", form.articleType);
      payload.append("manuscriptTitle", form.manuscriptTitle);
      payload.append("abstract", form.abstract);
      form.files.forEach((file) => {
        payload.append("files", file);
      });

      const response = await api.post("/submissions", payload, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setStatus(response.data?.message || "Manuscript submitted successfully.");
      setForm(initialForm);
    } catch (error) {
      setStatus(error.response?.data?.message || "Manuscript submission failed.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="section-shell">
      <div className="container-shell space-y-8">
        <section className="card-panel p-6 sm:p-8 lg:p-10">
          <SectionHeader
            label="Submit Manuscript"
            title="Online article submission form"
            description="Complete the form below with author, journal, manuscript, and file details."
          />

          <div className="mt-8">
            <form onSubmit={handleSubmit} className="rounded-3xl border border-brand-border bg-brand-surface p-6 sm:p-8">
              <div className="grid gap-5">
                <div>
                  <label className="form-label" data-required="true">Name</label>
                  <input
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    placeholder="Enter your Name"
                    required
                  />
                </div>

                <div>
                  <label className="form-label" data-required="true">Email address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    placeholder="Enter email"
                    required
                  />
                </div>

                <div>
                  <label className="form-label" data-required="true">Postal Address</label>
                  <textarea
                    rows="4"
                    value={form.postalAddress}
                    onChange={(event) => setForm({ ...form, postalAddress: event.target.value })}
                    placeholder="Enter postal address"
                    required
                  />
                </div>

                <div>
                  <label className="form-label" data-required="true">Country</label>
                  <select value={form.country} onChange={(event) => setForm({ ...form, country: event.target.value })} required>
                    <option value="">Select Your Country</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label" data-required="true">Journal</label>
                  <select value={form.journalId} onChange={(event) => setForm({ ...form, journalId: event.target.value })} required>
                    <option value="">Select Journal</option>
                    {journalOptions.map((journal) => (
                      <option key={journal.value} value={journal.value}>
                        {journal.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label" data-required="true">Article Type</label>
                  <input
                    value={form.articleType}
                    onChange={(event) => setForm({ ...form, articleType: event.target.value })}
                    placeholder="Enter your article type"
                    required
                  />
                </div>

                <div>
                  <label className="form-label" data-required="true">Manuscript Title</label>
                  <textarea
                    rows="3"
                    value={form.manuscriptTitle}
                    onChange={(event) => setForm({ ...form, manuscriptTitle: event.target.value })}
                    placeholder="Enter manuscript title"
                    required
                  />
                </div>

                <div>
                  <label className="form-label" data-required="true">Abstract</label>
                  <textarea
                    rows="5"
                    value={form.abstract}
                    onChange={(event) => setForm({ ...form, abstract: event.target.value })}
                    placeholder="Enter manuscript abstract"
                    required
                  />
                </div>

                <div>
                  <label className="form-label" data-required="true">Attach your file</label>
                  <input
                    type="file"
                    multiple
                    onChange={(event) => setForm({ ...form, files: Array.from(event.target.files || []) })}
                    required
                  />
                  <p className="mt-2 text-xs text-brand-slate">
                    Note: If you want to select multiple files press Ctrl + File selection.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button type="submit" className="button-primary px-5 py-3" disabled={isSaving || !journalOptions.length}>
                    {isSaving ? "Submitting..." : "Submit"}
                  </button>
                </div>

                {status ? <p className="text-sm text-brand-slate">{status}</p> : null}
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
