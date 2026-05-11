import { BookOpen, CalendarDays, Database, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { shouldUseDevelopmentFallback, withFallback } from "../../api/client";
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
  const featuredJournals = mockJournals.slice(0, 4);
  const [testimonials, setTestimonials] = useState(mockTestimonials);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const useDevelopmentFallback = shouldUseDevelopmentFallback();
  const statIcons = [BookOpen, FileText, CalendarDays, Database];

  useEffect(() => {
    withFallback(() => api.get("/testimonials"), useDevelopmentFallback ? mockTestimonials : []).then((data) =>
      setTestimonials(data.length ? data : mockTestimonials)
    );
  }, [useDevelopmentFallback]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveHeroIndex((current) => (current + 1) % heroShowcaseImages.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div>
      <section className="relative isolate overflow-hidden bg-brand-mist">
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
          <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(10,18,34,0.84)_0%,rgba(10,18,34,0.68)_40%,rgba(10,18,34,0.5)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.28),transparent_22%),radial-gradient(circle_at_left_center,rgba(198,40,40,0.24),transparent_28%)]" />
        </div>

        <div className="relative">
          <div className="container-shell flex min-h-[80vh] items-center py-14 sm:min-h-[84vh] lg:min-h-[90vh] lg:py-20">
            <div className="max-w-3xl text-white">
              <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-brand-gold">
                Medmax Publishers
              </span>
              <h1 className="mt-6 font-display text-4xl font-semibold leading-tight sm:text-5xl lg:text-7xl">
                Open Access Journals for Clinical, Medical, Life Science, Pharma, and Technology Research
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg sm:leading-8">
                Discover peer-reviewed journals, public PPT archives, and video resources through a cleaner,
                publication-first experience designed for authors, readers, and institutions.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
                <Link to="/journals" className="button-primary bg-brand-crimson hover:bg-brand-gold">
                  View Journals
                </Link>
                <Link
                  to="/ppts"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white shadow-lg backdrop-blur-sm transition duration-300 hover:border-brand-gold hover:bg-brand-gold hover:text-brand-mist"
                >
                  Browse PPTs
                </Link>
                <Link
                  to="/videos"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white shadow-lg backdrop-blur-sm transition duration-300 hover:border-brand-gold hover:bg-brand-gold hover:text-brand-mist"
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
                        ? "bg-white text-brand-crimson shadow-lg"
                        : "border border-white/25 bg-white/10 text-white hover:border-brand-gold hover:bg-white/15"
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
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {featuredJournals.map((journal) => (
              <JournalCard key={journal.id} journal={journal} />
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

      <section className="relative overflow-hidden pb-12 pt-4 sm:pb-14 lg:pb-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_left_center,rgba(37,99,235,0.1),transparent_28%),radial-gradient(circle_at_right_top,rgba(198,40,40,0.08),transparent_26%)]" />
        <div className="container-shell relative">
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(14,18,33,0.96),rgba(21,27,46,0.94))] shadow-[0_30px_70px_rgba(0,0,0,0.28)]">
            <div className="grid gap-10 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[minmax(260px,0.82fr)_minmax(0,1.18fr)] lg:items-center lg:gap-14 lg:px-10 lg:py-12">
              <div className="flex justify-center lg:justify-start">
                <div className="relative w-full max-w-[26rem] lg:max-w-[29rem]">
                  <div className="absolute inset-[12%] rounded-full bg-brand-crimson/10 blur-3xl" />
                  <div className="absolute inset-[18%] rounded-full bg-brand-teal/10 blur-3xl" />
                  <img
                    src={dnaImage}
                    alt="DNA visualization"
                    className="relative mx-auto w-full object-contain drop-shadow-[0_30px_55px_rgba(0,0,0,0.5)] lg:mx-0"
                  />
                </div>
              </div>

              <div className="text-white">
                <h2 className="font-display text-4xl font-semibold uppercase leading-[0.95] tracking-[0.04em] text-white sm:text-5xl lg:text-6xl xl:text-[5.2rem]">
                  <span className="block">The Science</span>
                  <span className="mt-1 block text-brand-crimson">Mandate</span>
                </h2>

                <div className="mt-6 h-[2px] w-14 bg-brand-crimson" />

                <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
                  Medmax Publishers was built on a simple conviction: scientific knowledge should remain visible,
                  discoverable, and accessible to the global research community.
                </p>
                <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
                  Our journals span clinical medicine, life sciences, pharma, public health, and engineering,
                  supported by rigorous peer review and open-access publishing workflows.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  {websiteStatHighlights.map((item) => (
                    <span
                      key={item}
                      className="rounded-sm border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <div className="mt-9 overflow-hidden rounded-[1.6rem] border border-white/10 bg-[linear-gradient(135deg,rgba(45,33,81,0.55),rgba(16,20,36,0.88))] shadow-[0_30px_60px_rgba(0,0,0,0.28)]">
                  <div className="grid sm:grid-cols-2">
                    {websiteStats.map((item, index) => {
                      const Icon = statIcons[index] || Database;
                      const borderClass =
                        index === 0
                          ? "border-b border-white/10 sm:border-b sm:border-r"
                          : index === 1
                            ? "border-b border-white/10"
                            : index === 2
                              ? "sm:border-r sm:border-white/10"
                              : "";

                      return (
                        <div key={item.label} className={`flex items-center gap-4 px-5 py-6 sm:px-6 sm:py-7 ${borderClass}`}>
                          <div
                            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${
                              index % 2 === 0 ? "bg-brand-crimson/70" : "bg-brand-navy/70"
                            }`}
                          >
                            <Icon size={24} />
                          </div>
                          <div>
                            <p className="text-4xl font-semibold leading-none text-white sm:text-5xl">{item.value}</p>
                            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.26em] text-slate-300">
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
