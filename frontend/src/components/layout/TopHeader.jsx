import { Mail, Phone, Search } from "lucide-react";
import { companyInfo } from "../../data/mockData";

export default function TopHeader({ searchTerm, setSearchTerm, onSearch }) {
  return (
    <div className="border-b border-brand-navy/10 bg-white">
      <div className="container-shell flex flex-col gap-4 py-3 sm:py-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex justify-center xl:justify-start">
          <a href="/" className="flex items-center">
            <img src="/medmax-logo.png" alt="Medmax Publishers" className="h-14 w-auto sm:h-16 lg:h-20" />
          </a>
        </div>

        <form
          onSubmit={onSearch}
          className="flex w-full items-center gap-2 rounded-2xl border border-brand-sky bg-brand-mist px-3 py-2 sm:rounded-full xl:max-w-2xl"
        >
          <Search size={18} className="shrink-0 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search journals, PPT archives, videos, and topics"
            className="border-none bg-transparent p-0 shadow-none focus:ring-0"
          />
          <button className="button-primary shrink-0 px-4 py-2" type="submit">
            Search
          </button>
        </form>

        <div className="flex flex-col items-center gap-2 text-center text-sm text-brand-slate xl:items-end xl:text-right">
          <a href={`mailto:${companyInfo.email}`} className="flex items-center gap-2 break-all hover:text-brand-gold sm:break-normal">
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
