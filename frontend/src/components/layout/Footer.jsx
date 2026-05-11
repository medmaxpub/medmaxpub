import { Facebook, Linkedin, MapPin, Phone, Twitter } from "lucide-react";
import { Link } from "react-router-dom";
import { companyInfo } from "../../data/mockData";

export default function Footer() {
  return (
    <footer className="bg-brand-ink text-white">
      <div className="container-shell grid gap-8 py-10 sm:py-12 md:grid-cols-2 xl:grid-cols-3">
        <div>
          <div className="inline-flex rounded-3xl bg-white px-4 py-3 shadow-panel">
            <img src="/medmax-logo.png" alt="Medmax Publishers" className="h-14 w-auto" />
          </div>
          <p className="mt-4 max-w-sm text-sm leading-7 text-slate-300">
            Medmax Publishers supports journal publishing, educational media, archive presentation, and
            cross-disciplinary scholarly exchange through a clean public research platform.
          </p>
        </div>

        <div className="min-w-0">
          <h3 className="text-lg font-semibold">Quick Links</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-slate-300">
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/journals">Journals</Link>
            <Link to="/ppts">PPTs</Link>
            <Link to="/videos">Videos</Link>
            <Link to="/submit-manuscript">Submit Manuscript</Link>
            <Link to="/membership">Membership</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>

        <div className="min-w-0">
          <h3 className="text-lg font-semibold">Contact Info</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <div className="flex items-start gap-3">
              <MapPin size={18} className="mt-0.5 shrink-0" />
              <div>{companyInfo.addressLines.map((line) => <div key={line}>{line}</div>)}</div>
            </div>
            <a href={`mailto:${companyInfo.email}`} className="block break-all hover:text-white sm:break-normal">
              {companyInfo.email}
            </a>
            <a href={`tel:${companyInfo.phone}`} className="flex items-center gap-2 hover:text-white">
              <Phone size={16} />
              {companyInfo.phone}
            </a>
            <div className="flex gap-3 pt-2">
              {[Facebook, Twitter, Linkedin].map((Icon, index) => (
                <span key={index} className="rounded-full border border-white/20 p-2">
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
