import { BookOpen, CalendarDays, Database, FileText } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cachedGet, shouldUseDevelopmentFallback, withFallback } from "../../api/client";
import dnaImage from "../../assets/DNA.png";
import AboutMedmaxSection from "../../components/common/AboutMedmaxSection";
import JournalCard from "../../components/common/JournalCard";
import SectionHeader from "../../components/common/SectionHeader";
import {
  heroShowcaseImages,
  indexingPartners,
  mockJournals,
  mockTestimonials,
  websiteStatHighlights,
  websiteStats
} from "../../data/mockData";

export default function HomePage() {
  const [featuredJournals, setFeaturedJournals] = useState(() => (shouldUseDevelopmentFallback() ? mockJournals.slice(0, 4) : []));
  const [testimonials, setTestimonials] = useState(mockTestimonials);
  const [stats, setStats] = useState(websiteStats);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const useDevelopmentFallback = shouldUseDevelopmentFallback();
  const statIcons = [BookOpen, FileText, CalendarDays, Database];

  const loadFeaturedJournals = useCallback(() => {
    return withFallback(() => cachedGet("/journals"), useDevelopmentFallback ? mockJournals : []).then((data) => {
      setFeaturedJournals((Array.isArray(data) ? data : []).slice(0, 4));
    });
  }, [useDevelopmentFallback]);

  const loadTestimonials = useCallback(() => {
    return withFallback(() => cachedGet("/testimonials"), useDevelopmentFallback ? mockTestimonials : []).then((data) =>
      setTestimonials(data.length ? data : mockTestimonials)
    );
  }, [useDevelopmentFallback]);

  const loadSiteStats = useCallback(() => {
    return withFallback(() => cachedGet("/site-stats"), useDevelopmentFallback ? { stats: websiteStats } : { stats: websiteStats }).then((data) =>
      setStats(Array.isArray(data?.stats) && data.stats.length ? data.stats : websiteStats)
    );
  }, [useDevelopmentFallback]);

  useEffect(() => {
    loadFeaturedJournals();
  }, [loadFeaturedJournals]);

  useEffect(() => {
    loadTestimonials();
  }, [loadTestimonials]);

  useEffect(() => {
    loadSiteStats();
  }, [loadSiteStats]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveHeroIndex((current) => (current + 1) % heroShowcaseImages.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div>
      <section className="relative isolate overflow-hidden bg-white">
        <div className="absolute inset-0">
          {heroShowcaseImages.map((item, index) => (
            <div
              key={item.id}
              className={`absolute inset-0 transition-all duration-1000 ${
                activeHeroIndex === index ? "scale-100 opacity-100" : "scale-105 opacity-0"
              }`}
              aria-hidden={activeHeroIndex !== index}
            >
              <img src={item.image} alt={item.title} className="h-full w-full object-cover object-center" />
            </div>
          ))}
          <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0.38)_0%,rgba(255,255,255,0.14)_40%,rgba(255,255,255,0.08)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(198,40,40,0.08),transparent_22%),radial-gradient(circle_at_left_center,rgba(37,99,235,0.06),transparent_28%)]" />
        </div>

        <div className="relative">
          <div className="container-shell flex min-h-[50vh] items-center py-10 sm:min-h-[52vh] lg:min-h-[56vh] lg:py-12">
            <div className="max-w-3xl text-brand-ink">
              <span className="inline-flex rounded-full border border-brand-crimson/15 bg-brand-crimson/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-brand-crimson">
                Medmax Publishers
              </span>
              <h1 className="mt-6 font-display text-4xl font-semibold leading-tight sm:text-5xl lg:text-7xl">
                Open Access Journals for Clinical, Medical, Life Science, Pharma, and Technology Research
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-brand-slate sm:text-lg sm:leading-8">
                Discover peer-reviewed journals, public PPT archives, and video resources through a cleaner,
                publication-first experience designed for authors, readers, and institutions.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
                <Link to="/journals" className="button-primary">
                  View Journals
                </Link>
                <Link
                  to="/ppts"
                  className="button-secondary"
                >
                  Browse PPTs
                </Link>
                <Link
                  to="/videos"
                  className="button-secondary"
                >
                  Browse Videos
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {heroShowcaseImages.map((item, index) => (
                  <button
                    key={item.id}
                  type="button"
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    activeHeroIndex === index
                      ? "border border-brand-crimson bg-brand-crimson text-white shadow-lg"
                      : "border border-brand-border bg-white text-brand-ink hover:border-brand-navy hover:bg-brand-sky"
                  }`}
                  onClick={() => setActiveHeroIndex(index)}
                >
                    {item.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <AboutMedmaxSection />

      <section className="section-shell">
        <div className="container-shell">
          <SectionHeader
            label="Featured Journals"
            title="Open access journal profiles with direct public URLs"
            description="Each featured journal now highlights only the core Medmax profile fields used in the admin portal."
          />
          {featuredJournals.length ? (
            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {featuredJournals.map((journal) => (
                <JournalCard key={journal.id} journal={journal} />
              ))}
            </div>
          ) : (
            <div className="mt-10 card-panel p-6 text-brand-slate">
              No live journals have been published yet.
            </div>
          )}
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
          <div className="partner-marquee mt-10">
            <div className="partner-marquee-track">
              {[...indexingPartners, ...indexingPartners].map((partner, index) => (
                <div
                  key={`${partner}-${index}`}
                  className="partner-marquee-item card-panel flex min-h-28 items-center justify-center px-6 py-5 text-center text-sm font-semibold uppercase tracking-[0.18em] text-brand-ink"
                >
                  {partner}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-white pb-12 pt-4 sm:pb-14 lg:pb-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_left_center,rgba(37,99,235,0.06),transparent_28%),radial-gradient(circle_at_right_top,rgba(198,40,40,0.06),transparent_26%)]" />
        <div className="container-shell relative">
          <div className="overflow-hidden rounded-[2rem] border border-brand-border bg-white shadow-panel">
            <div className="grid gap-10 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[minmax(260px,0.82fr)_minmax(0,1.18fr)] lg:items-center lg:gap-14 lg:px-10 lg:py-12">
              <div className="flex justify-center lg:justify-start">
                <div className="relative w-full max-w-[26rem] lg:max-w-[29rem]">
                  <div className="absolute inset-[12%] rounded-full bg-brand-crimson/8 blur-3xl" />
                  <div className="absolute inset-[18%] rounded-full bg-brand-teal/8 blur-3xl" />
                  <img
                    src={dnaImage}
                    alt="DNA visualization"
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                    className="relative mx-auto w-full object-contain drop-shadow-[0_24px_45px_rgba(15,23,42,0.12)] lg:mx-0"
                  />
                </div>
              </div>

              <div className="text-brand-ink">
                <h2 className="font-display text-4xl font-semibold uppercase leading-[0.95] tracking-[0.04em] text-brand-ink sm:text-5xl lg:text-6xl xl:text-[5.2rem]">
                  <span className="block">The Science</span>
                  <span className="mt-1 block text-brand-crimson">Mandate</span>
                </h2>

                <div className="mt-6 h-[2px] w-14 bg-brand-crimson" />

                <p className="mt-6 max-w-3xl text-base leading-8 text-brand-slate sm:text-lg">
                  Medmax Publishers was built on a simple conviction: scientific knowledge should remain visible,
                  discoverable, and accessible to the global research community.
                </p>
                <p className="mt-5 max-w-3xl text-base leading-8 text-brand-slate sm:text-lg">
                  Our journals span clinical medicine, life sciences, pharma, public health, and engineering,
                  supported by rigorous peer review and open-access publishing workflows.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  {websiteStatHighlights.map((item) => (
                    <span
                      key={item}
                      className="rounded-sm border border-brand-border bg-brand-elevated px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-slate"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <div className="mt-9 overflow-hidden rounded-[1.6rem] border border-brand-border bg-white shadow-panel">
                  <div className="grid sm:grid-cols-2">
                    {stats.map((item, index) => {
                      const Icon = statIcons[index] || Database;
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
                            <Icon size={24} />
                          </div>
                          <div>
                            <p className="text-4xl font-semibold leading-none text-brand-ink sm:text-5xl">{item.value}</p>
                            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.26em] text-brand-slate">
                              {item.label}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="container-shell">
          <SectionHeader
            label="Testimonials"
            title="Trusted voices from the global research community"
            description="See how authors, editors, reviewers, and academic leaders describe their publishing experience with Medmax Publishers."
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
