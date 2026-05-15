import SectionHeader from "../../components/common/SectionHeader";

const membershipPlans = [
  {
    type: "Individual",
    oneYear: "$5,619",
    twoYears: "$10,019",
    threeYears: "$15,999"
  },
  {
    type: "Institutional",
    oneYear: "$15,019",
    twoYears: "$19,999",
    threeYears: "$23,999"
  }
];

const membershipHighlights = [
  "Submit unlimited articles for the selected membership period.",
  "Applicable for both regular issues and special issues.",
  "Suitable for individual researchers as well as universities and institutes.",
  "Memberships can be extended for up to 3 years."
];

export default function MembershipPage() {
  return (
    <div className="section-shell">
      <div className="container-shell space-y-8">
        <section className="card-panel p-6 sm:p-8 lg:p-10">
          <SectionHeader
            label="Membership"
            title="Membership plans for Medmax authors and institutions"
            description="Choose a membership period that supports recurring publication needs with clear duration-based pricing."
          />

          <div className="mt-8 rounded-3xl border border-brand-border bg-white p-6 sm:p-8">
            <div className="space-y-5 text-brand-slate">
              <p className="leading-8">
                <span className="font-semibold text-brand-ink">Medmax Publishers</span> is a peer-reviewed, open access
                publishing platform covering Clinical, Medicine, Life Sciences, Pharma, and Engineering & Technology
                domains.
              </p>
              <p className="leading-8">
                Medmax offers membership plans that allow authors and institutions to publish
                <span className="font-semibold text-brand-ink"> unlimited articles for the selected membership period</span>
                {" "}without paying separate article charges for every submission.
              </p>
              <p className="leading-8">
                Upon membership approval, the member profile can be associated with publication activity across the
                Medmax platform to improve professional visibility and continuity.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {membershipHighlights.map((item) => (
                <div key={item} className="rounded-3xl border border-brand-border bg-brand-elevated p-5">
                  <p className="font-medium leading-7 text-brand-ink">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 overflow-hidden rounded-3xl border border-brand-border">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse bg-white">
                  <thead>
                    <tr className="bg-brand-sky text-left text-brand-ink">
                      <th className="px-5 py-4 text-sm font-semibold uppercase tracking-[0.12em]">Membership Type</th>
                      <th className="px-5 py-4 text-sm font-semibold uppercase tracking-[0.12em]">1 Year</th>
                      <th className="px-5 py-4 text-sm font-semibold uppercase tracking-[0.12em]">2 Years</th>
                      <th className="px-5 py-4 text-sm font-semibold uppercase tracking-[0.12em]">3 Years</th>
                    </tr>
                  </thead>
                  <tbody>
                    {membershipPlans.map((plan, index) => (
                      <tr key={plan.type} className={index % 2 === 0 ? "bg-white" : "bg-brand-surface"}>
                        <td className="px-5 py-4 text-base font-semibold text-brand-ink">{plan.type}</td>
                        <td className="px-5 py-4 text-brand-slate">{plan.oneYear}</td>
                        <td className="px-5 py-4 text-brand-slate">{plan.twoYears}</td>
                        <td className="px-5 py-4 text-brand-slate">{plan.threeYears}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="mt-5 text-sm italic text-brand-slate">
              Valid for 365 days from the date of registration for each 1-year membership term.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
