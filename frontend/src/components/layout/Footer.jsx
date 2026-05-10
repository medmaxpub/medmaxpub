import { Facebook, Linkedin, MapPin, Phone, Twitter } from "lucide-react";
import { Link } from "react-router-dom";
import { companyInfo } from "../../data/mockData";

export default function Footer() {
  return (
    <footer className="bg-brand-navy text-white">
      <div className="container-shell grid gap-10 py-14 md:grid-cols-3">
        <div>
          <p className="font-display text-3xl font-semibold">medmaxpub</p>
          <p className="mt-4 max-w-sm text-sm leading-7 text-slate-300">
            medmaxpub supports global scientific meetings, journal publishing, author submissions,
            educational media, and cross-disciplinary scholarly exchange.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold">Quick Links</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-slate-300">
            <Link to="/">Home</Link>
            <Link to="/journals">Journals</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/journals">Author Guidelines</Link>
            <Link to="/submit-manuscript">Submit Manuscript</Link>
            <Link to="/start-journal">Start Journal</Link>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold">Contact Info</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <div className="flex items-start gap-3">
              <MapPin size={18} className="mt-0.5 shrink-0" />
              <div>{companyInfo.addressLines.map((line) => <div key={line}>{line}</div>)}</div>
            </div>
            <a href={`mailto:${companyInfo.email}`} className="block hover:text-white">
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
