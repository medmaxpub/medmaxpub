import { Mail, MapPin, Phone } from "lucide-react";
import SectionHeader from "../../components/common/SectionHeader";
import { companyInfo } from "../../data/mockData";

export default function ContactPage() {
  return (
    <div className="section-shell">
      <div className="container-shell space-y-8">
        <section className="card-panel p-6 sm:p-8 lg:p-10">
          <SectionHeader
            label="Contact"
            title="Connect with the Medmax Publishers team"
            description="Use the details below for publication support, journal coordination, and scholarly communication queries."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-3 text-brand-navy">
                <Mail size={18} />
                <h2 className="font-semibold">Email</h2>
              </div>
              <a href={`mailto:${companyInfo.email}`} className="mt-4 block text-sm leading-7 text-slate-600 hover:text-brand-gold">
                {companyInfo.email}
              </a>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-3 text-brand-navy">
                <Phone size={18} />
                <h2 className="font-semibold">Phone</h2>
              </div>
              <a href={`tel:${companyInfo.phone}`} className="mt-4 block text-sm leading-7 text-slate-600 hover:text-brand-gold">
                {companyInfo.phone}
              </a>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-3 text-brand-navy">
                <MapPin size={18} />
                <h2 className="font-semibold">Address</h2>
              </div>
              <div className="mt-4 space-y-1 text-sm leading-7 text-slate-600">
                {companyInfo.addressLines.map((line) => (
                  <div key={line}>{line}</div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
