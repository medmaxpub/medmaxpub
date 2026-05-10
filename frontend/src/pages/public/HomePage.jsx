import { ArrowRight, Download, Eye, PlayCircle } from "lucide-react";
import { useEffect, useState } from "react";
import PptPreviewModal from "../../components/common/PptPreviewModal";
import { Link } from "react-router-dom";
import SectionHeader from "../../components/common/SectionHeader";
import {
  conferenceServices,
  homeSlides,
  indexingPartners,
  mockJournals,
  mockPpts,
  mockTestimonials,
  mockVideos,
  regionBadges,
  scientificReach
} from "../../data/mockData";
import { normalizePptItem } from "../../utils/pptPreview";
import { normalizeVideoItem } from "../../utils/videoPlayer";

export default function HomePage() {
  const [activePreview, setActivePreview] = useState(null);
  const featuredJournals = mockJournals.slice(0, 4);
  const featuredVideo = mockVideos[0] ? normalizeVideoItem(mockVideos[0]) : null;
  const featuredPpts = mockPpts.map(normalizePptItem);
  const featuredVideoLink = featuredVideo?.journalSlug ? `/journals/${featuredVideo.journalSlug}/videos` : "/journals";

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setActivePreview(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden bg-brand-navy text-white">
        <div className="absolute inset-0 bg-hero-texture" />
        <div className="container-shell relative py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <span className="eyebrow bg-white/10 text-white">Global Scientific Network</span>
              <h1 className="max-w-4xl font-display text-5xl font-semibold leading-tight sm:text-6xl">
                Empowering global scientific collaboration through meetings, journals, and research visibility.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
                Build a confident, conference-led digital presence for medmaxpub while adding journals, journal-owned PPTs,
                videos, manuscript workflows, and admin-managed publishing operations.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/journals" className="button-primary">
                  Explore Journals
                </Link>
                <Link to="/start-journal" className="button-secondary border-white text-white hover:bg-white hover:text-brand-navy">
                  Start Journal
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                {regionBadges.map((region) => (
                  <span key={region} className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm">
                    {region}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              {homeSlides.map((slide, index) => (
                <article
                  key={slide.id}
                  className={`card-panel overflow-hidden border-white/10 p-5 backdrop-blur ${
                    index === 0 ? "bg-white/10" : "bg-white/5"
                  }`}
                >
                  <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr] md:items-center">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-brand-gold">{slide.eyebrow}</p>
                      <h2 className="mt-3 font-display text-2xl font-semibold text-white">{slide.title}</h2>
                      <p className="mt-3 text-sm leading-7 text-slate-200">{slide.description}</p>
                      <div className="mt-4 flex flex-wrap gap-3 text-sm">
                        <Link to={slide.primaryLink} className="inline-flex items-center gap-2 font-semibold text-brand-gold">
                          {slide.primaryLabel}
                          <ArrowRight size={16} />
                        </Link>
                        <Link to={slide.secondaryLink} className="text-slate-200 hover:text-white">
                          {slide.secondaryLabel}
                        </Link>
                      </div>
                    </div>
                    <img src={slide.image} alt={slide.title} className="h-44 w-full rounded-3xl object-cover" />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="container-shell">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <SectionHeader
                label="Impact Beyond Borders"
                title="Advancing scientific dialogue across the world"
                description="The homepage structure follows the medmaxpub tone: confident positioning, polished credibility, and strong support for global research exchange."
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {scientificReach.map((item) => (
                <div key={item.title} className="card-panel p-6">
                  <h3 className="font-display text-2xl font-semibold text-brand-navy">{item.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell bg-white">
        <div className="container-shell">
          <SectionHeader
            label="Featured Journals"
            title="Open access journals aligned with conference-driven scientific communities"
            description="Journals are presented in a polished directory layout with direct access to current issues, archive pages, and submission-ready detail views."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {featuredJournals.map((journal) => (
              <article key={journal.id} className="card-panel overflow-hidden">
                <img src={journal.coverImageUrl} alt={journal.title} className="h-72 w-full object-cover" />
                <div className="p-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-brand-teal">{journal.category}</p>
                  <h3 className="mt-3 font-display text-2xl font-semibold text-brand-navy">{journal.title}</h3>
                  <p className="mt-2 text-sm text-slate-500">{journal.issn}</p>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{journal.description}</p>
                  <Link to={`/journals/${journal.slug}/home`} className="button-primary mt-5">
                    View Journal
                  </Link>
                </div>
              </article>
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
                className="card-panel flex min-h-28 items-center justify-center px-6 py-5 text-center text-sm font-semibold uppercase tracking-[0.18em] text-brand-navy"
              >
                {partner}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell bg-white">
        <div className="container-shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="card-panel overflow-hidden">
            {featuredVideo ? (
              featuredVideo.youtubeUrl ? (
                <iframe
                  title={featuredVideo.title}
                  src={featuredVideo.youtubeUrl}
                  className="aspect-video w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : featuredVideo.videoUrl ? (
                <video controls className="aspect-video w-full" poster={featuredVideo.thumbnailUrl || undefined}>
                  <source src={featuredVideo.videoUrl} />
                </video>
              ) : (
                <img src={featuredVideo.thumbnailUrl} alt={featuredVideo.title} className="aspect-video w-full object-cover" />
              )
            ) : (
              <div className="flex aspect-video items-center justify-center bg-slate-100 text-sm text-slate-500">
                Journal videos will appear here once they are published.
              </div>
            )}
            <div className="p-8">
              <span className="eyebrow">Journal Video Preview</span>
              <h2 className="font-display text-3xl font-semibold text-brand-navy">
                {featuredVideo?.title || "Journal-owned video playback"}
              </h2>
              <p className="mt-4 text-slate-600">
                Feature keynote previews, research explainers, or event highlight reels as journal-owned videos with
                YouTube embeds or uploaded media playback.
              </p>
              <p className="mt-3 text-sm text-slate-500">{featuredVideo?.journalTitle || "Choose a journal to view its video library."}</p>
              <Link to={featuredVideoLink} className="button-primary mt-6">
                <PlayCircle size={16} className="mr-2" />
                Open Journal Videos
              </Link>
            </div>
          </div>

          <div className="space-y-8">
            <div className="card-panel p-8">
              <SectionHeader
                label="Journal PPTs"
                title="Presentation files published inside journals"
                description="Allow each journal to publish conference decks, speaker resources, and educational materials as part of its own journal experience."
              />
              <div className="mt-6 space-y-4">
                {featuredPpts.map((ppt) => (
                  <div key={ppt.id} className="rounded-2xl border border-slate-200 p-5">
                    <h3 className="font-semibold text-brand-navy">{ppt.title}</h3>
                    <p className="mt-2 text-sm text-slate-500">{ppt.description}</p>
                    <div className="mt-4 flex gap-3">
                      <button type="button" className="button-soft px-4 py-2" onClick={() => setActivePreview(ppt)}>
                        <Eye size={16} className="mr-2" />
                        View
                      </button>
                      <a href={ppt.fileUrl} className="button-primary px-4 py-2">
                        <Download size={16} className="mr-2" />
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <PptPreviewModal ppt={activePreview} onClose={() => setActivePreview(null)} />

      <section className="section-shell">
        <div className="container-shell">
          <SectionHeader
            label="Testimonials"
            title="What speakers, editors, and delegates say"
            description="A testimonial carousel can be powered from admin-managed entries, with text or video-based social proof."
            align="center"
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {mockTestimonials.map((item) => (
              <article key={item.id} className="card-panel p-8">
                <p className="text-lg leading-8 text-slate-700">"{item.message}"</p>
                <div className="mt-6">
                  <p className="font-semibold text-brand-navy">{item.name}</p>
                  <p className="text-sm text-slate-500">{item.role}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell bg-white">
        <div className="container-shell">
          <SectionHeader
            label="Operational Excellence"
            title="Every detail is managed with precision"
            description="This section echoes the medmaxpub experience by balancing strategic messaging with polished operational services."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {conferenceServices.map((service) => (
              <div key={service} className="card-panel p-6">
                <h3 className="font-display text-2xl font-semibold text-brand-navy">{service}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Structured workflows, reliable coordination, and researcher-friendly delivery make this service area
                  part of the complete medmaxpub experience.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
