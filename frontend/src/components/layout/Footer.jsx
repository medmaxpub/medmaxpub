import { Facebook, Linkedin, MapPin, Phone, Twitter } from "lucide-react";
import { Link } from "react-router-dom";
import { companyInfo } from "../../data/mockData";

export default function Footer() {
  return (
    <footer className="border-t border-brand-border bg-brand-surface text-brand-ink">
      <div className="container-shell grid gap-8 py-10 sm:py-12 md:grid-cols-2 xl:grid-cols-3">
        <div>
          <div className="inline-flex rounded-3xl border border-brand-border bg-brand-elevated px-4 py-3 shadow-panel">
            <img src="/medmax-logo.png" alt="Medmax Publishers" className="h-20 w-auto sm:h-24" />
          </div>
        </div>

        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-brand-ink">Quick Links</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-brand-slate">
            <Link to="/" className="transition hover:text-brand-gold">Home</Link>
            <Link to="/about" className="transition hover:text-brand-gold">About</Link>
            <Link to="/journals" className="transition hover:text-brand-gold">Journals</Link>
            <Link to="/ppts" className="transition hover:text-brand-gold">PPTs</Link>
            <Link to="/videos" className="transition hover:text-brand-gold">Videos</Link>
            <Link to="/submit-manuscript" className="transition hover:text-brand-gold">Submit Manuscript</Link>
            <Link to="/membership" className="transition hover:text-brand-gold">Membership</Link>
            <Link to="/contact" className="transition hover:text-brand-gold">Contact</Link>
          </div>
        </div>

        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-brand-ink">Contact Info</h3>
          <div className="mt-4 space-y-3 text-sm text-brand-slate">
            <div className="flex items-start gap-3">
              <MapPin size={18} className="mt-0.5 shrink-0 text-brand-gold" />
              <div>{companyInfo.addressLines.map((line) => <div key={line}>{line}</div>)}</div>
            </div>
            <a href={`mailto:${companyInfo.email}`} className="block break-all transition hover:text-brand-gold sm:break-normal">
              {companyInfo.email}
            </a>
            <a href={`tel:${companyInfo.phone}`} className="flex items-center gap-2 transition hover:text-brand-gold">
              <Phone size={16} className="text-brand-gold" />
              {companyInfo.phone}
            </a>
            <div className="flex gap-3 pt-2">
              {[Facebook, Twitter, Linkedin].map((Icon, index) => (
                <span
                  key={index}
                  className="rounded-full border border-brand-border bg-brand-elevated p-2 text-brand-slate transition hover:border-brand-gold hover:text-brand-gold"
                >
                  <Icon size={16} />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
