import { BarChart3 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import api, { shouldUseDevelopmentFallback, withFallback } from "../../api/client";
import SectionHeader from "../../components/common/SectionHeader";
import { websiteStats } from "../../data/mockData";

const fallbackValues = websiteStats.reduce((accumulator, item) => {
  accumulator[item.label] = item.value;
  return accumulator;
}, {});

const initialForm = {
  activeJournals: fallbackValues["Active Journals"] || "18+",
  publications: fallbackValues.Publications || "260+",
  yearsPublishing: fallbackValues["Years Publishing"] || "10+",
  indexDatabases: fallbackValues["Index Databases"] || "7+"
};

function normalizeValues(data) {
  return {
    activeJournals: data?.values?.activeJournals || initialForm.activeJournals,
    publications: data?.values?.publications || initialForm.publications,
    yearsPublishing: data?.values?.yearsPublishing || initialForm.yearsPublishing,
    indexDatabases: data?.values?.indexDatabases || initialForm.indexDatabases
  };
}

export default function SuperUserSiteStatsPage() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const useDevelopmentFallback = shouldUseDevelopmentFallback();

  const loadSiteStats = useCallback(async () => {
    const data = await withFallback(
      () => api.get("/admin/site-stats"),
      useDevelopmentFallback ? { values: initialForm } : { values: initialForm }
    );

    setForm(normalizeValues(data));
  }, [useDevelopmentFallback]);

  useEffect(() => {
    loadSiteStats();
  }, [loadSiteStats]);

  const submitSiteStats = async (event) => {
    event.preventDefault();
    setStatus("");
    setIsSaving(true);

    try {
      const response = await api.put("/admin/site-stats", form);
      setForm(normalizeValues(response.data));
      setStatus("Homepage stats updated successfully.");
    } catch (error) {
      setStatus(error.response?.data?.message || "Homepage stats save failed.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="card-panel p-6 sm:p-8">
        <SectionHeader
          label="Homepage Stats"
          title="Homepage numbers management"
          description="Update the public homepage stat values shown in the Medmax science mandate section."
        />

        <div className="mt-8 grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl border border-brand-border bg-brand-elevated p-6">
            <form onSubmit={submitSiteStats} className="grid gap-4">
              <div>
                <label className="form-label" data-required="true">Active Journals</label>
                <input
                  value={form.activeJournals}
                  onChange={(event) => setForm((current) => ({ ...current, activeJournals: event.target.value }))}
                  placeholder="18+"
                  required
                />
              </div>
              <div>
                <label className="form-label" data-required="true">Publications</label>
                <input
                  value={form.publications}
                  onChange={(event) => setForm((current) => ({ ...current, publications: event.target.value }))}
                  placeholder="260+"
                  required
                />
              </div>
              <div>
                <label className="form-label" data-required="true">Years Publishing</label>
                <input
                  value={form.yearsPublishing}
                  onChange={(event) => setForm((current) => ({ ...current, yearsPublishing: event.target.value }))}
                  placeholder="10+"
                  required
                />
              </div>
              <div>
                <label className="form-label" data-required="true">Index Databases</label>
                <input
                  value={form.indexDatabases}
                  onChange={(event) => setForm((current) => ({ ...current, indexDatabases: event.target.value }))}
                  placeholder="7+"
                  required
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button type="submit" className="button-primary" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Homepage Stats"}
                </button>
              </div>

              {status ? <p className="text-sm text-brand-slate">{status}</p> : null}
            </form>
          </div>

          <div className="rounded-3xl border border-brand-border bg-brand-surface p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">Preview</p>
            <div className="mt-4 overflow-hidden rounded-[1.6rem] border border-brand-border bg-white shadow-panel">
              <div className="grid sm:grid-cols-2">
                {[
                  { label: "Active Journals", value: form.activeJournals },
                  { label: "Publications", value: form.publications },
                  { label: "Years Publishing", value: form.yearsPublishing },
                  { label: "Index Databases", value: form.indexDatabases }
                ].map((item, index) => {
                  const borderClass =
                    index === 0
                      ? "border-b border-brand-border sm:border-b sm:border-r"
                      : index === 1
                        ? "border-b border-brand-border"
                        : index === 2
                          ? "sm:border-r sm:border-brand-border"
                          : "";

                  return (
                    <div key={item.label} className={`flex items-center gap-4 px-5 py-6 sm:px-6 sm:py-7 ${borderClass}`}>
                      <div
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${
                          index % 2 === 0 ? "bg-brand-crimson text-white" : "bg-brand-navy text-white"
                        }`}
                      >
                        <BarChart3 size={24} />
                      </div>
                      <div>
                        <p className="text-4xl font-semibold leading-none text-brand-ink sm:text-5xl">{item.value}</p>
                        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.26em] text-brand-slate">{item.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
