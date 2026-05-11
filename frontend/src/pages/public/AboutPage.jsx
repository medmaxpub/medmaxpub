import SectionHeader from "../../components/common/SectionHeader";
import { conferenceServices, regionBadges, scientificReach } from "../../data/mockData";

export default function AboutPage() {
  return (
    <div className="section-shell">
      <div className="container-shell space-y-8">
        <section className="card-panel p-6 sm:p-8 lg:p-10">
          <SectionHeader
            label="About medmaxpub"
            title="Welcome to medmaxpub"
            description="This platform reflects the medmaxpub publishing ecosystem across journals, media, and admin-driven research workflows."
          />
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rich-copy">
              <p>
                Scientific Research Conferences are vibrant gatherings where experts and enthusiasts come together to
                share discoveries, build collaborations, and advance knowledge across science, health care,
                engineering, and technology.
              </p>
              <p>
                The site experience is designed to feel professional, credible, and globally oriented, giving event
                organizers, journal editors, speakers, and authors one central place to manage visibility and
                participation.
              </p>
            </div>
            <div className="rounded-3xl bg-brand-navy p-5 text-white sm:p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-brand-gold">Regions</p>
              <div className="mt-5 flex flex-wrap gap-3">
                {regionBadges.map((region) => (
                  <span key={region} className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm">
                    {region}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {scientificReach.map((item) => (
            <article key={item.title} className="card-panel p-6 sm:p-8">
              <h2 className="font-display text-2xl font-semibold text-brand-navy sm:text-3xl">{item.title}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">{item.description}</p>
            </article>
          ))}
        </section>

        <section className="card-panel p-6 sm:p-8 lg:p-10">
          <SectionHeader
            label="Services"
            title="Comprehensive support for exceptional scientific and professional events"
            description="Conference planning, research visibility, journals, and publication assets are all brought together in one operational system."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {conferenceServices.map((service) => (
              <div key={service} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="font-semibold text-brand-navy">{service}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Delivered with structured workflows, audience awareness, and polished scientific presentation.
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
