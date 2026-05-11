import { Mail, Phone, Search } from "lucide-react";
import { companyInfo } from "../../data/mockData";

export default function TopHeader({ searchTerm, setSearchTerm, onSearch }) {
  return (
    <div className="border-b border-brand-border bg-brand-surface">
      <div className="container-shell flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <a
            href="/"
            className="inline-flex items-center rounded-3xl border border-brand-border bg-brand-elevated px-4 py-3 shadow-panel"
          >
            <img src="/medmax-logo.png" alt="Medmax Publishers" className="h-24 w-auto sm:h-28 lg:h-32" />
          </a>
        </div>

        <form
          onSubmit={onSearch}
          className="flex w-full max-w-xl items-center gap-2 rounded-full border border-brand-border bg-brand-elevated px-3 py-2"
        >
          <Search size={18} className="text-brand-slate" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search journals, PPT archives, videos, and topics"
            className="border-none bg-transparent p-0 text-sm shadow-none focus:ring-0"
          />
          <button className="button-primary min-h-10 px-4 py-2" type="submit">
            Search
          </button>
        </form>

        <div className="space-y-2 text-sm text-brand-slate lg:min-w-[170px]">
          <a href={`mailto:${companyInfo.email}`} className="flex items-center gap-2 hover:text-brand-gold">
            <Mail size={16} />
            {companyInfo.email}
          </a>
          <a href={`tel:${companyInfo.phone}`} className="flex items-center gap-2 hover:text-brand-gold">
            <Phone size={16} />
            {companyInfo.phone}
          </a>
        </div>
      </div>
    </div>
  );
}
