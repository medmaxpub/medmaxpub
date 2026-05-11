import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { shouldUseDevelopmentFallback, withFallback } from "../../api/client";
import SectionHeader from "../../components/common/SectionHeader";
import {
  aboutMedmaxParagraphs,
  heroShowcaseImages,
  indexingPartners,
  mediaCollections,
  mockJournals,
  mockTestimonials,
  regionBadges,
  scientificReach
} from "../../data/mockData";

export default function HomePage() {
  const featuredJournals = mockJournals.slice(0, 4);
  const loopingHeroImages = [...heroShowcaseImages, ...heroShowcaseImages];
  const [testimonials, setTestimonials] = useState(mockTestimonials);
  const useDevelopmentFallback = shouldUseDevelopmentFallback();

  useEffect(() => {
    withFallback(() => api.get("/testimonials"), useDevelopmentFallback ? mockTestimonials : []).then((data) =>
      setTestimonials(data.length ? data : mockTestimonials)
    );
  }, [useDevelopmentFallback]);

  return (
    <div>
      <section>
        <div className="container-shell py-10 lg:py-14">
          <div className="overflow-hidden rounded-[2rem] border border-brand-border bg-brand-surface shadow-panel">
            <div className="hero-marquee">
              <div className="hero-marquee-track">
                {loopingHeroImages.map((item, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    className="hero-marquee-slide h-[220px] overflow-hidden bg-brand-elevated border-r border-brand-border/60 last:border-r-0 sm:h-[280px] lg:h-[350px]"
                    aria-hidden={index >= heroShowcaseImages.length}
                  >
                    <img
                      src={item.image}
                      alt={index < heroShowcaseImages.length ? item.title : ""}
                      className="block h-full max-h-[220px] w-full max-w-full object-cover object-center sm:max-h-[280px] lg:max-h-[350px]"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-brand-border bg-brand-surface px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
              <div className="mx-auto max-w-4xl text-center">
                <span className="eyebrow mb-4">Medmax Publishers</span>
                <h1 className="font-display text-3xl font-semibold leading-tight text-brand-ink sm:text-4xl lg:text-6xl">
                  Open Access Journals for Clinical, Medical, Life Science, Pharma, and Technology Research
                </h1>
                <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-brand-slate sm:mt-5 sm:text-lg sm:leading-8">
                  Discover peer-reviewed journals, public PPT archives, and video resources presented through a clean,
                  publication-first experience.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3 sm:mt-8 sm:gap-4">
                  <Link to="/journals" className="button-primary">
                    View Journals
                  </Link>
                  <Link to="/ppts" className="button-secondary">
                    Browse PPTs
                  </Link>
                  <Link to="/videos" className="button-secondary">
                    Browse Videos
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="container-shell">
          <SectionHeader
            label="Featured Journals"
            title="Open access journal profiles with direct public URLs"
            description="Each featured journal now highlights only the core Medmax profile fields used in the admin portal."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {featuredJournals.map((journal) => (
              <Link key={journal.id} to={`/journals/${journal.journalUrl}/about`} className="journal-card-link">
                <article className="card-panel h-full p-5 sm:p-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-brand-teal">{journal.journalDomainName}</p>
                  <h3 className="mt-3 font-display text-2xl font-semibold text-brand-ink">{journal.managingJournalName}</h3>
                  <p className="mt-2 text-sm text-brand-slate">
                    Managed by {journal.firstName} {journal.lastName}
                  </p>
                  <p className="mt-2 text-sm text-brand-slate">URL: {journal.journalUrl}</p>
                  <p className="mt-4 text-sm leading-7 text-brand-slate">{journal.aboutJournal}</p>
                  <span className="button-primary mt-5">View Journal</span>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="container-shell">
          <SectionHeader
            label="Indexing & Reach"
            title="Discoverability signals for scientific credibility"
            description="Indexing logos are displayed in a clean strip similar to publisher and conference trust sections."
            align="center"
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {indexingPartners.map((partner) => (
              <div
                key={partner}
                className="card-panel flex min-h-28 items-center justify-center px-6 py-5 text-center text-sm font-semibold uppercase tracking-[0.18em] text-brand-ink"
              >
                {partner}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="container-shell">
          <SectionHeader
            label="Testimonials"
            title="What speakers, editors, and delegates say"
            description="A testimonial carousel can be powered from admin-managed entries, with text or video-based social proof."
            align="center"
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {testimonials.map((item) => (
              <article key={item.id} className="card-panel p-6 sm:p-8">
                <p className="text-lg leading-8 text-brand-slate">"{item.message}"</p>
                <div className="mt-6">
                  <p className="font-semibold text-brand-ink">{item.name}</p>
                  <p className="text-sm text-brand-slate">{item.designation}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
