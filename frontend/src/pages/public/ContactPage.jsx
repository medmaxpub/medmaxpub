import { LoaderCircle, Mail, MapPin, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../api/client";
import SectionHeader from "../../components/common/SectionHeader";
import { companyInfo } from "../../data/mockData";

const initialForm = {
  fullName: "",
  email: "",
  subject: "",
  message: ""
};

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast.message) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      onClose();
    }, 4000);

    return () => window.clearTimeout(timeoutId);
  }, [onClose, toast.message]);

  if (!toast.message) {
    return null;
  }

  const toneClassName =
    toast.type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-rose-200 bg-rose-50 text-rose-700";

  return (
    <div className="pointer-events-none fixed right-4 top-24 z-50 w-full max-w-sm">
      <div className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-lg ${toneClassName}`}>
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium leading-6">{toast.message}</p>
          <button type="button" className="text-xs font-semibold uppercase tracking-[0.14em]" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  const [form, setForm] = useState(initialForm);
  const [toast, setToast] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      subject: form.subject.trim(),
      message: form.message.trim()
    };

    if (!payload.fullName || !payload.email || !payload.subject || !payload.message) {
      showToast("error", "All contact form fields are required.");
      return;
    }

    if (!isValidEmail(payload.email)) {
      showToast("error", "Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post("/contact/send", payload);
      showToast("success", response.data?.message || "Your message has been sent successfully.");
      setForm(initialForm);
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message || "Unable to send your message right now. Please try again later."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-6 sm:py-8 lg:py-10">
      <Toast toast={toast} onClose={() => setToast({ type: "", message: "" })} />

      <div className="container-shell space-y-6">
        <section className="card-panel p-5 sm:p-6 lg:p-8">
          <SectionHeader
            label="Contact Form"
            title="Send a message to the Medmax Publishers team"
            description="Use the form below for publication support, journal coordination, and general scholarly communication questions."
          />

          <form onSubmit={handleSubmit} className="mt-5 rounded-2xl border border-brand-border bg-brand-surface p-5 sm:p-6">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-1">
                <label className="form-label" data-required="true">Full Name</label>
                <input
                  value={form.fullName}
                  onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                  placeholder="Enter your full name"
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="md:col-span-1">
                <label className="form-label" data-required="true">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="Enter your email address"
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="form-label" data-required="true">Subject</label>
                <input
                  value={form.subject}
                  onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
                  placeholder="Enter the message subject"
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="form-label" data-required="true">Message</label>
                <textarea
                  rows="6"
                  value={form.message}
                  onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                  placeholder="Write your message"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="mt-6">
              <button type="submit" className="button-primary inline-flex items-center gap-2 px-5 py-3" disabled={isSubmitting}>
                {isSubmitting ? <LoaderCircle size={18} className="animate-spin" /> : null}
                {isSubmitting ? "Sending..." : "Submit"}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-brand-border bg-white px-5 py-5 shadow-sm sm:px-6 lg:px-8">
          <SectionHeader
            label="Contact"
            title="Connect with the Medmax Publishers team"
            description="Use the details below for publication support, journal coordination, and scholarly communication queries."
          />
          <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(320px,1.35fr)]">
            <a
              href={`mailto:${companyInfo.email}`}
              className="flex items-start gap-3 rounded-2xl border border-brand-border bg-brand-elevated p-4 text-brand-slate transition hover:border-brand-teal hover:bg-brand-sky"
            >
              <Mail size={18} className="mt-0.5 shrink-0 text-brand-ink" />
              <span className="min-w-0">
                <span className="block font-semibold text-brand-ink">Email</span>
                <span className="mt-1 block text-sm leading-6">{companyInfo.email}</span>
              </span>
            </a>
            <a
              href={`tel:${companyInfo.phone}`}
              className="flex items-start gap-3 rounded-2xl border border-brand-border bg-brand-elevated p-4 text-brand-slate transition hover:border-brand-teal hover:bg-brand-sky"
            >
              <Phone size={18} className="mt-0.5 shrink-0 text-brand-ink" />
              <span className="min-w-0">
                <span className="block font-semibold text-brand-ink">Phone</span>
                <span className="mt-1 block text-sm leading-6">{companyInfo.phone}</span>
              </span>
            </a>
            <div className="flex items-start gap-3 rounded-2xl border border-brand-border bg-brand-elevated p-4 text-brand-slate">
              <MapPin size={18} className="mt-0.5 shrink-0 text-brand-ink" />
              <div className="min-w-0">
                <h2 className="font-semibold text-brand-ink">Address</h2>
                <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-sm leading-6">
                  {companyInfo.addressLines.map((line, index) => (
                    <span key={line}>
                      {line}
                      {index < companyInfo.addressLines.length - 1 ? "," : ""}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
