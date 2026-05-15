import { Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import api from "../../api/client";
import SectionHeader from "../../components/common/SectionHeader";
import { companyInfo } from "../../data/mockData";

export default function ContactPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: ""
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "", message: "" });

    if (!form.fullName.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      setStatus({ type: "error", message: "All contact form fields are required." });
      return;
    }

    if (!isValidEmail(form.email.trim())) {
      setStatus({ type: "error", message: "Please enter a valid email address." });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post("/contact", {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim()
      });

      setStatus({ type: "success", message: response.data.message || "Message sent successfully." });
      setForm({
        fullName: "",
        email: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.response?.data?.message || "Unable to send your message right now. Please try again later."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <div className="rounded-3xl border border-brand-border bg-brand-elevated p-5">
              <div className="flex items-center gap-3 text-brand-ink">
                <Mail size={18} />
                <h2 className="font-semibold">Email</h2>
              </div>
              <a href={`mailto:${companyInfo.email}`} className="mt-4 block text-sm leading-7 text-brand-slate hover:text-brand-gold">
                {companyInfo.email}
              </a>
            </div>
            <div className="rounded-3xl border border-brand-border bg-brand-elevated p-5">
              <div className="flex items-center gap-3 text-brand-ink">
                <Phone size={18} />
                <h2 className="font-semibold">Phone</h2>
              </div>
              <a href={`tel:${companyInfo.phone}`} className="mt-4 block text-sm leading-7 text-brand-slate hover:text-brand-gold">
                {companyInfo.phone}
              </a>
            </div>
            <div className="rounded-3xl border border-brand-border bg-brand-elevated p-5">
              <div className="flex items-center gap-3 text-brand-ink">
                <MapPin size={18} />
                <h2 className="font-semibold">Address</h2>
              </div>
              <div className="mt-4 space-y-1 text-sm leading-7 text-brand-slate">
                {companyInfo.addressLines.map((line) => (
                  <div key={line}>{line}</div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="card-panel p-6 sm:p-8 lg:p-10">
          <SectionHeader
            label="Contact Form"
            title="Send a message to the Medmax Publishers team"
            description="Use the form below for publication support, journal coordination, and general scholarly communication questions."
          />

          <form onSubmit={handleSubmit} className="mt-8 rounded-3xl border border-brand-border bg-brand-surface p-6 sm:p-8">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-1">
                <label className="form-label" data-required="true">Full Name</label>
                <input
                  value={form.fullName}
                  onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                  placeholder="Enter your full name"
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
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="form-label" data-required="true">Subject</label>
                <input
                  value={form.subject}
                  onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
                  placeholder="Enter the message subject"
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
                  required
                />
              </div>
            </div>

            {status.message ? (
              <p className={`mt-5 text-sm ${status.type === "success" ? "text-emerald-400" : "text-rose-400"}`}>
                {status.message}
              </p>
            ) : null}

            <div className="mt-6">
              <button type="submit" className="button-primary px-5 py-3" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Submit"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
