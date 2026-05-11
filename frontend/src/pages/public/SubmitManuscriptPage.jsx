import { useMemo, useState } from "react";
import SectionHeader from "../../components/common/SectionHeader";
import { mockJournals } from "../../data/mockData";

const articleTypes = [
  "Original Research",
  "Review Article",
  "Case Report",
  "Short Communication",
  "Mini Review",
  "Editorial",
  "Commentary",
  "Letter to the Editor"
];

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
  journal: "",
  articleType: "",
  manuscriptTitle: "",
  abstract: "",
  files: []
};

export default function SubmitManuscriptPage() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("");
  const journalOptions = useMemo(
    () => mockJournals.map((journal) => ({ value: journal.journalUrl, label: journal.managingJournalName })),
    []
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    setStatus("Submission form captured successfully. The editorial team can now connect this form to a live backend workflow.");
    setForm(initialForm);
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
                  <label className="mb-2 block text-sm font-medium text-brand-slate">Name</label>
                  <input
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    placeholder="Enter your Name"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-brand-slate">Email address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    placeholder="Enter email"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-brand-slate">Postal Address</label>
                  <textarea
                    rows="4"
                    value={form.postalAddress}
                    onChange={(event) => setForm({ ...form, postalAddress: event.target.value })}
                    placeholder="Enter postal address"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-brand-slate">Country</label>
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
                  <label className="mb-2 block text-sm font-medium text-brand-slate">Journal</label>
                  <select value={form.journal} onChange={(event) => setForm({ ...form, journal: event.target.value })} required>
                    <option value="">Select Journal</option>
                    {journalOptions.map((journal) => (
                      <option key={journal.value} value={journal.value}>
                        {journal.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-brand-slate">Article Type</label>
                  <select
                    value={form.articleType}
                    onChange={(event) => setForm({ ...form, articleType: event.target.value })}
                    required
                  >
                    <option value="">Select Your Article Type</option>
                    {articleTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-brand-slate">Manuscript Title</label>
                  <textarea
                    rows="3"
                    value={form.manuscriptTitle}
                    onChange={(event) => setForm({ ...form, manuscriptTitle: event.target.value })}
                    placeholder="Enter manuscript title"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-brand-slate">Abstract</label>
                  <textarea
                    rows="5"
                    value={form.abstract}
                    onChange={(event) => setForm({ ...form, abstract: event.target.value })}
                    placeholder="Enter manuscript abstract"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-brand-slate">Attach your file</label>
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
                  <button type="submit" className="button-primary px-5 py-3">
                    Submit
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
