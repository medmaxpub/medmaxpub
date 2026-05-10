import { Mail, Phone, Search } from "lucide-react";
import { companyInfo } from "../../data/mockData";

export default function TopHeader({ searchTerm, setSearchTerm, onSearch }) {
  return (
    <div className="border-b border-brand-navy/10 bg-white">
      <div className="container-shell flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <a href="/" className="font-display text-3xl font-semibold tracking-tight text-brand-navy">
            medmaxpub
          </a>
          <p className="mt-1 text-sm text-slate-500">Scientific research conferences, journals, media, and author support</p>
        </div>

        <form
          onSubmit={onSearch}
          className="flex w-full max-w-2xl items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2"
        >
          <Search size={18} className="text-slate-400" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search journals, topics, articles, speakers or resources"
            className="border-none bg-transparent p-0 shadow-none focus:ring-0"
          />
          <button className="button-primary px-4 py-2" type="submit">
            Search
          </button>
        </form>

        <div className="space-y-2 text-sm text-slate-600">
          <a href={`mailto:${companyInfo.email}`} className="flex items-center gap-2 hover:text-brand-teal">
            <Mail size={16} />
            {companyInfo.email}
          </a>
          <a href={`tel:${companyInfo.phone}`} className="flex items-center gap-2 hover:text-brand-teal">
            <Phone size={16} />
            {companyInfo.phone}
          </a>
        </div>
      </div>
    </div>
  );
}
