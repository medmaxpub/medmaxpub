import { Mail, Phone, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { medmaxTransparentLogo } from "../../assets/branding";
import { companyInfo } from "../../data/mockData";

export default function TopHeader({ searchTerm, setSearchTerm, onSearch }) {
  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="container-shell flex flex-col gap-4 py-3 sm:py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex justify-start">
          <Link to="/" className="inline-flex items-center">
            <img src={medmaxTransparentLogo} alt="Medmax Publishers" className="h-14 w-auto sm:h-16 lg:h-20" />
          </Link>
        </div>

        <div className="flex w-full flex-col gap-3 lg:max-w-md lg:items-end">
          <div className="flex flex-col gap-2 text-sm text-slate-600 sm:flex-row sm:flex-wrap sm:gap-x-5 sm:gap-y-2 lg:justify-end">
            <a
              href={`mailto:${companyInfo.email}`}
              className="flex items-center gap-2 break-all transition hover:text-brand-crimson sm:break-normal"
            >
              <Mail size={16} className="text-brand-crimson" />
              {companyInfo.email}
            </a>
            <a href={`tel:${companyInfo.phoneHref}`} className="flex items-center gap-2 transition hover:text-brand-crimson">
              <Phone size={16} className="text-brand-crimson" />
              {companyInfo.phone}
            </a>
          </div>

          <form
            onSubmit={onSearch}
            className="flex w-full max-w-[22rem] items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
          >
            <Search size={18} className="shrink-0 text-slate-500" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search journals"
              className="!border-none !bg-transparent !p-0 !text-sm !text-slate-800 !shadow-none placeholder:!text-slate-400 focus:!ring-0"
            />
            <button className="button-primary min-h-10 shrink-0 px-4 py-2" type="submit">
              Search
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
