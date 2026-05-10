import { useState } from "react";
import api from "../../api/client";
import SectionHeader from "../../components/common/SectionHeader";
import { companyInfo } from "../../data/mockData";

const initialForm = {
  name: "",
  email: "",
  subject: "",
  message: ""
};

export default function ContactPage() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await api.post("/contact", form);
      setStatus("Your message has been sent successfully.");
      setForm(initialForm);
    } catch (error) {
      setStatus("The backend is not reachable right now, but the form is wired for MongoDB message storage.");
    }
  };

  return (
    <div className="section-shell">
      <div className="container-shell grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="card-panel p-8">
          <SectionHeader
            label="Contact"
            title="Publisher contact details"
            description="Store inquiries in MongoDB and review them from the protected admin dashboard."
          />
          <div className="mt-6 space-y-3 text-slate-600">
            {companyInfo.addressLines.map((line) => (
              <div key={line}>{line}</div>
            ))}
            <div className="pt-2">{companyInfo.email}</div>
            <div>{companyInfo.phone}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card-panel p-8">
          <SectionHeader
            label="Send Message"
            title="Contact form"
            description="Messages are submitted to the REST API and stored in the `contactMessages` collection."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="Name"
              required
            />
            <input
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="Email"
              type="email"
              required
            />
            <input
              value={form.subject}
              onChange={(event) => setForm({ ...form, subject: event.target.value })}
              placeholder="Subject"
              className="sm:col-span-2"
              required
            />
            <textarea
              value={form.message}
              onChange={(event) => setForm({ ...form, message: event.target.value })}
              placeholder="Message"
              rows="6"
              className="sm:col-span-2"
              required
            />
          </div>
          <div className="mt-6 flex items-center justify-between gap-4">
            <button type="submit" className="button-primary">
              Send Message
            </button>
            {status ? <p className="text-sm text-slate-500">{status}</p> : null}
          </div>
        </form>
      </div>
    </div>
  );
}

