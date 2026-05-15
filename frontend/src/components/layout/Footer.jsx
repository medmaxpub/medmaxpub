import { Facebook, Linkedin, Mail, MapPin, Phone, Twitter } from "lucide-react";
import { Link } from "react-router-dom";
import { medmaxPrimaryLogo } from "../../assets/branding";
import { companyInfo } from "../../data/mockData";

export default function Footer() {
  return (
    <footer className="border-t border-brand-navy/10 bg-[#9fc3f2] text-brand-ink">
      <div className="container-shell grid gap-8 py-10 sm:py-12 md:grid-cols-2 xl:grid-cols-[1.15fr_0.8fr_1fr] xl:gap-12">
        <div className="xl:pr-6">
          <Link to="/" className="inline-flex transition hover:opacity-90">
            <img src={medmaxPrimaryLogo} alt="Medmax Publishers" className="h-24 w-auto sm:h-28" />
          </Link>
          <p className="mt-4 max-w-md text-sm leading-7 text-brand-slate">
            Medmax Publishers is a peer-reviewed, open access publisher covering a comprehensive range of topics in
            Clinical, Medicine, Life Sciences, Pharma, and Engineering & Technology.
          </p>
        </div>

        <div className="min-w-0 xl:justify-self-center">
          <h3 className="text-lg font-semibold text-brand-ink">Quick Links</h3>
          <div className="mt-4 flex flex-col gap-2 text-sm text-brand-slate">
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

        <div className="min-w-0 xl:pl-4">
          <h3 className="text-lg font-semibold text-brand-ink">Contact Info</h3>
          <div className="mt-4 space-y-3 text-sm text-brand-slate">
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
                  className="rounded-full border border-brand-navy/12 bg-white/95 p-2 text-brand-ink transition hover:border-brand-gold hover:bg-white hover:text-brand-gold"
                >
                  <Icon size={16} />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-brand-navy/20 bg-[#173b87]">
        <div className="container-shell flex flex-col items-center gap-3 py-4 text-center text-sm text-white">
          <div className="flex items-center justify-center gap-5 whitespace-nowrap font-medium">
            <Link to="/terms-and-conditions" className="transition hover:text-brand-gold">
              Terms and Conditions
            </Link>
            <Link to="/withdraw-policy" className="transition hover:text-brand-gold">
              Withdraw Policy
            </Link>
            <Link to="/privacy-policy" className="transition hover:text-brand-gold">
              Privacy Policy
            </Link>
          </div>
          <p className="font-semibold">&copy; 2026 Copyrights Medmax Publishers. All Rights Reserved!</p>
        </div>
      </div>
    </footer>
  );
}
