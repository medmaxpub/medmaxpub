import { useCallback, useEffect, useMemo, useState } from "react";
import api, { cachedGet, shouldUseDevelopmentFallback, withFallback } from "../../api/client";
import SectionHeader from "../../components/common/SectionHeader";
import { mockJournals } from "../../data/mockData";

const countries = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Côte d'Ivoire",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic (Czechia)",
  "Democratic Republic of the Congo",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Holy See (Vatican City)",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "São Tomé and Príncipe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe"
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
