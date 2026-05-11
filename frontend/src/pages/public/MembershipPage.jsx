import SectionHeader from "../../components/common/SectionHeader";

const membershipBenefits = [
  "Priority visibility across journal, PPT, and video publishing touchpoints",
  "Editorial and scholarly network access for institutions and research teams",
  "Publication-oriented support for conferences, speakers, and delegates",
  "Structured collaboration environment for global scientific communities"
];

export default function MembershipPage() {
  return (
    <div className="section-shell">
      <div className="container-shell space-y-8">
        <section className="card-panel p-6 sm:p-8 lg:p-10">
          <SectionHeader
            label="Membership"
            title="Membership pathways for institutions, researchers, and scholarly partners"
            description="Designed for communities that want recurring access to publishing support, scientific visibility, and knowledge-sharing infrastructure."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {membershipBenefits.map((item) => (
              <div key={item} className="rounded-3xl border border-brand-border bg-brand-elevated p-5">
                <h2 className="font-semibold text-brand-ink">{item}</h2>
                <p className="mt-3 text-sm leading-7 text-brand-slate">
                  Delivered through a clean platform experience, publication workflows, and media-ready scholarly presentation.
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
