import { Facebook, Linkedin, Mail, MapPin, Phone, Twitter } from "lucide-react";
import { Link } from "react-router-dom";
import { medmaxTransparentLogo } from "../../assets/branding";
import { companyInfo } from "../../data/mockData";

export default function Footer() {
  return (
    <footer className="border-t border-brand-navy/60 bg-[#1d3f74] text-white">
      <div className="container-shell grid gap-8 py-10 sm:py-12 md:grid-cols-2 xl:grid-cols-3">
        <div>
          <Link to="/" className="inline-flex transition hover:opacity-90">
            <img src={medmaxTransparentLogo} alt="Medmax Publishers" className="h-20 w-auto sm:h-24" />
          </Link>
        </div>

        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-white">Quick Links</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-white/85">
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
          <h3 className="text-lg font-semibold text-white">Contact Info</h3>
          <div className="mt-4 space-y-3 text-sm text-white/85">
            <div className="flex items-start gap-3">
              <MapPin size={18} className="mt-0.5 shrink-0 text-brand-gold" />
              <div>{companyInfo.addressLines.map((line) => <div key={line}>{line}</div>)}</div>
            </div>
            <a
              href={`mailto:${companyInfo.email}`}
              className="flex items-center gap-2 break-all transition hover:text-brand-gold sm:break-normal"
            >
              <Mail size={16} className="shrink-0 text-brand-gold" />
              {companyInfo.email}
            </a>
            <a href={`tel:${companyInfo.phoneHref}`} className="flex items-center gap-2 transition hover:text-brand-gold">
              <Phone size={16} className="text-brand-gold" />
              {companyInfo.phone}
            </a>
            <div className="flex gap-3 pt-2">
              {[Facebook, Twitter, Linkedin].map((Icon, index) => (
                <span
                  key={index}
                  className="rounded-full border border-white/20 bg-white/5 p-2 text-white transition hover:border-brand-gold hover:bg-white/10 hover:text-brand-gold"
                >
                  <Icon size={16} />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 bg-[#16315a]">
        <div className="container-shell flex flex-col items-center gap-3 py-4 text-center text-sm text-white">
          <div className="flex items-center justify-center gap-5 whitespace-nowrap font-medium">
            <Link to="/terms-and-conditions" className="transition hover:text-white/75">
              Terms and Conditions
            </Link>
            <Link to="/withdraw-policy" className="transition hover:text-white/75">
              Withdraw Policy
            </Link>
            <Link to="/privacy-policy" className="transition hover:text-white/75">
              Privacy Policy
            </Link>
          </div>
          <p className="font-semibold">&copy; 2026 Copyrights Medmax Publishers. All Rights Reserved!</p>
        </div>
      </div>
    </footer>
  );
}
