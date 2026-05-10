import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";
import SectionHeader from "../../components/common/SectionHeader";
import { useAuth } from "../../context/AuthContext";

const initialForm = {
  ownerName: "",
  ownerEmail: "",
  ownerPassword: "",
  title: "",
  slug: "",
  issn: "",
  category: "",
  description: "",
  home: "",
  about: "",
  aimScope: "",
  editorialBoard: "",
  authorGuidelines: "",
  articleInPress: "",
  coverImage: null
};

export default function StartJournalPage() {
  const navigate = useNavigate();
  const { authenticate } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("");
    setIsSubmitting(true);

    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (value) {
        formData.append(key, value);
      }
    });

    try {
      const response = await api.post("/journals/onboard", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      authenticate(response.data);
      navigate("/admin/dashboard");
    } catch (error) {
      setStatus(error.response?.data?.message || "Journal setup failed. Please review your details and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="section-shell">
      <div className="container-shell">
        <form onSubmit={handleSubmit} className="card-panel mx-auto max-w-6xl p-8">
          <SectionHeader
            label="Start Journal"
            title="Create your journal and owner portal"
            description="Set up your journal, create your username and password, and open your own journal admin portal in one step."
          />

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <input
              value={form.ownerName}
              onChange={(event) => setForm({ ...form, ownerName: event.target.value })}
              placeholder="Your Name"
              required
            />
            <input
              value={form.ownerEmail}
              onChange={(event) => setForm({ ...form, ownerEmail: event.target.value })}
              placeholder="Email"
              type="email"
              required
            />
            <input
              value={form.ownerPassword}
              onChange={(event) => setForm({ ...form, ownerPassword: event.target.value })}
              placeholder="Password"
              type="password"
              required
            />
            <input
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="Journal Title"
              required
            />
            <input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder="Journal Slug" required />
            <input value={form.issn} onChange={(event) => setForm({ ...form, issn: event.target.value })} placeholder="ISSN" required />
            <input
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
              placeholder="Category"
              required
            />
            <div className="sm:col-span-2">
              <textarea
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="Journal Description"
                rows="4"
                required
              />
            </div>
            <textarea value={form.home} onChange={(event) => setForm({ ...form, home: event.target.value })} placeholder="Journal Home" rows="4" />
            <textarea value={form.about} onChange={(event) => setForm({ ...form, about: event.target.value })} placeholder="About" rows="4" />
            <textarea value={form.aimScope} onChange={(event) => setForm({ ...form, aimScope: event.target.value })} placeholder="Aim & Scope" rows="4" />
            <textarea
              value={form.editorialBoard}
              onChange={(event) => setForm({ ...form, editorialBoard: event.target.value })}
              placeholder="Editorial Board"
              rows="4"
            />
            <textarea
              value={form.authorGuidelines}
              onChange={(event) => setForm({ ...form, authorGuidelines: event.target.value })}
              placeholder="Author Guidelines"
              rows="4"
            />
            <textarea
              value={form.articleInPress}
              onChange={(event) => setForm({ ...form, articleInPress: event.target.value })}
              placeholder="Article In Press"
              rows="4"
            />
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-600">Journal Cover Image</label>
              <input type="file" accept="image/*" onChange={(event) => setForm({ ...form, coverImage: event.target.files?.[0] || null })} />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
            <button type="submit" className="button-primary" disabled={isSubmitting}>
              {isSubmitting ? "Creating Journal..." : "Create Journal Portal"}
            </button>
            {status ? <p className="text-sm text-slate-500">{status}</p> : null}
          </div>
        </form>
      </div>
    </div>
  );
}
