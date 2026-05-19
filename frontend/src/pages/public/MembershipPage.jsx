import SectionHeader from "../../components/common/SectionHeader";

const membershipPlans = [
  {
    type: "Individual",
    oneYear: "$4,019",
    twoYears: "$8,019",
    threeYears: "$12,999"
  },
  {
    type: "Institutional",
    oneYear: "$12,999",
    twoYears: "$15,999",
    threeYears: "$19,999"
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
                Medmax Publishers is a peer-reviewed, open-access publishing platform dedicated to advancing research
                across Clinical Sciences, Medicine, Life Sciences, Pharma, Engineering, and Technology disciplines.
                The platform supports global researchers, academicians, and institutions by providing accessible and
                high-quality scholarly publishing services.
              </p>
              <p className="leading-8">
                Medmax offers flexible membership plans that enable authors and institutions to publish unlimited
                articles during the selected membership period without incurring separate article processing charges for
                each submission. This model promotes cost-effective and continuous research dissemination.
              </p>
              <p className="leading-8">
                Following membership approval, member profiles can be integrated with publication activities across the
                Medmax platform, helping enhance professional visibility, academic recognition, and long-term research
                continuity.
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

            <p className="mt-5 text-base italic text-brand-slate sm:text-lg">
              Valid for 365 days from the date of registration for each 1-year membership term.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
