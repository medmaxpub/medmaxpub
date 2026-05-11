import SectionHeader from "../../components/common/SectionHeader";
import { aboutMedmaxCoverage, aboutMedmaxHighlights, aboutMedmaxParagraphs } from "../../data/mockData";

export default function AboutPage() {
  return (
    <div className="section-shell">
      <div className="container-shell">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div className="card-panel p-6 sm:p-8 lg:p-10">
            <SectionHeader
              label="About Medmax Publishers"
              title="A peer-reviewed open access platform built for global scientific knowledge sharing"
              description="The following profile appears directly below the homepage hero so visitors immediately understand the Medmax publishing mission."
            />
            <div className="rich-copy mt-8 text-base">
              {aboutMedmaxParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {aboutMedmaxHighlights.map((item) => (
              <div key={item.label} className="card-panel p-5 sm:p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-brand-gold">{item.label}</p>
                <p className="mt-3 text-lg font-semibold leading-8 text-brand-ink">{item.value}</p>
              </div>
            ))}

            <div className="card-panel bg-brand-navy p-6 text-white">
              <p className="text-xs uppercase tracking-[0.22em] text-brand-gold">Coverage</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {aboutMedmaxCoverage.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-brand-gold/30 bg-white/5 px-4 py-3 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
