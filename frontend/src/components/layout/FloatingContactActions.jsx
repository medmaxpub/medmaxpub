import { Mail, MessageSquare, X } from "lucide-react";
import { useEffect, useState } from "react";

const whatsappUrl = "https://wa.me/17202034570";
const supportEmail = "contact@medmaxpub.com";

function WhatsAppIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className} fill="currentColor">
      <path d="M16.02 3.2C9 3.2 3.3 8.84 3.3 15.82c0 2.23.58 4.4 1.68 6.32L3 29l7.06-1.85a12.9 12.9 0 0 0 5.96 1.5h.01c7.02 0 12.67-5.64 12.67-12.64 0-3.38-1.31-6.55-3.7-8.94a12.55 12.55 0 0 0-8.98-3.86Zm0 22.96h-.01a10.7 10.7 0 0 1-5.44-1.48l-.39-.23-4.19 1.1 1.12-4.08-.26-.42a10.56 10.56 0 0 1-1.63-5.63c0-5.88 4.83-10.66 10.8-10.66 2.85 0 5.53 1.1 7.54 3.12a10.54 10.54 0 0 1 3.12 7.52c0 5.88-4.84 10.66-10.66 10.66Zm5.85-7.99c-.32-.16-1.92-.94-2.21-1.04-.29-.11-.5-.16-.71.16-.21.31-.82 1.04-1 1.26-.18.21-.37.24-.68.08-.31-.16-1.31-.48-2.49-1.52-.92-.82-1.54-1.83-1.72-2.14-.18-.32-.02-.49.14-.65.15-.15.31-.37.47-.55.16-.18.21-.31.32-.52.11-.21.05-.39-.03-.55-.08-.16-.71-1.71-.97-2.34-.26-.61-.53-.53-.71-.54h-.61c-.21 0-.55.08-.84.39-.29.32-1.11 1.08-1.11 2.63s1.14 3.05 1.29 3.26c.16.21 2.24 3.42 5.42 4.79.76.33 1.36.53 1.82.68.76.24 1.44.2 1.98.12.6-.09 1.92-.78 2.19-1.53.27-.76.27-1.4.19-1.54-.08-.13-.29-.21-.61-.37Z" />
    </svg>
  );
}

function Tooltip({ children, label, align = "left" }) {
  const alignmentClass = align === "right" ? "right-0 origin-bottom-right" : "left-0 origin-bottom-left";

  return (
    <div className="relative group">
      <span
        className={`pointer-events-none absolute bottom-full mb-3 hidden rounded-full bg-brand-navy px-3 py-1 text-xs font-semibold text-white shadow-lg transition duration-200 group-hover:block ${alignmentClass}`}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

export default function FloatingContactActions() {
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (!chatOpen) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setChatOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [chatOpen]);

  return (
    <>
      {chatOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-brand-navy/35 backdrop-blur-[1px]"
          onClick={() => setChatOpen(false)}
          aria-label="Close live chat support popup"
        />
      ) : null}

      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 px-4 sm:bottom-6 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-end justify-end gap-4">
          <div className="pointer-events-auto flex flex-col items-end gap-3">
            {chatOpen ? (
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="live-chat-support-title"
                className="w-[min(22rem,calc(100vw-2rem))] rounded-[1.75rem] border border-brand-border/60 bg-white p-5 text-left shadow-[0_24px_60px_rgba(15,23,42,0.22)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 id="live-chat-support-title" className="text-lg font-semibold text-slate-900">
                      Live Chat Support
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">We are available. Contact us at:</p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                    onClick={() => setChatOpen(false)}
                    aria-label="Close live chat support popup"
                  >
                    <X size={18} />
                  </button>
                </div>

                <a
                  href={`mailto:${supportEmail}`}
                  className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-brand-gold/70 hover:text-slate-900"
                >
                  <Mail size={18} className="text-brand-crimson" />
                  {supportEmail}
                </a>

                <a href={`mailto:${supportEmail}`} className="button-primary mt-5 w-full bg-brand-crimson hover:bg-brand-gold">
                  Send Email
                </a>
              </div>
            ) : null}

            <div className="flex items-center gap-3">
              <Tooltip label="Chat on WhatsApp" align="right">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  title="Chat on WhatsApp"
                  aria-label="Chat on WhatsApp"
                  className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_20px_45px_rgba(37,211,102,0.35)] transition duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:shadow-[0_26px_55px_rgba(37,211,102,0.45)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/30"
                >
                  <WhatsAppIcon className="h-7 w-7" />
                </a>
              </Tooltip>

              <Tooltip label="Live Chat Support" align="right">
                <button
                  type="button"
                  title="Live Chat Support"
                  aria-label="Open live chat support popup"
                  onClick={() => setChatOpen((current) => !current)}
                  className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-crimson text-white shadow-[0_20px_45px_rgba(198,40,40,0.32)] transition duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:shadow-[0_26px_55px_rgba(198,40,40,0.42)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-crimson/30"
                >
                  <MessageSquare size={24} />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
