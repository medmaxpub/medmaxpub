import { useCallback, useEffect, useState } from "react";
import api, { shouldUseDevelopmentFallback, withFallback } from "../../api/client";
import EmptyState from "../../components/common/EmptyState";
import SectionHeader from "../../components/common/SectionHeader";
import { getSuperUserTestimonialsFallback } from "./superUserFallbacks";
import { initialTestimonialForm, mapTestimonialToForm, normalizeItem } from "../../components/super/superUserShared";
import useAutoRefresh from "../../hooks/useAutoRefresh";

export default function SuperUserTestimonialsPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [editingTestimonialId, setEditingTestimonialId] = useState("");
  const [testimonialForm, setTestimonialForm] = useState(initialTestimonialForm);
  const [testimonialStatus, setTestimonialStatus] = useState("");
  const useDevelopmentFallback = shouldUseDevelopmentFallback();

  const loadTestimonials = useCallback(async () => {
    const data = await withFallback(
      () => api.get("/testimonials"),
      useDevelopmentFallback ? getSuperUserTestimonialsFallback() : []
    );
    setTestimonials(data.map(normalizeItem));
  }, [useDevelopmentFallback]);

  useEffect(() => {
    loadTestimonials();
  }, [loadTestimonials]);

  useAutoRefresh(loadTestimonials, { intervalMs: 15000 });

  const submitTestimonial = async (event) => {
    event.preventDefault();
    setTestimonialStatus("");

    try {
      const formData = new FormData();
      formData.append("name", testimonialForm.name);
      formData.append("designation", testimonialForm.designation);
      formData.append("message", testimonialForm.message);

      if (testimonialForm.image) {
        formData.append("image", testimonialForm.image);
      }

      const response = await api[editingTestimonialId ? "put" : "post"](
        editingTestimonialId ? `/testimonials/${editingTestimonialId}` : "/testimonials",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" }
        }
      );

      const savedTestimonial = normalizeItem(response.data);

      if (editingTestimonialId) {
        setTestimonials((current) => current.map((item) => (item.id === editingTestimonialId ? savedTestimonial : item)));
        setTestimonialStatus("Testimonial updated successfully.");
      } else {
        setTestimonials((current) => [savedTestimonial, ...current]);
        setTestimonialStatus("Testimonial created successfully.");
      }

      setEditingTestimonialId("");
      setTestimonialForm(initialTestimonialForm);
    } catch (error) {
      setTestimonialStatus(error.response?.data?.message || "Testimonial save failed.");
    }
  };

  const deleteTestimonial = async (testimonialId) => {
    setTestimonialStatus("");

    try {
      await api.delete(`/testimonials/${testimonialId}`);
      setTestimonials((current) => current.filter((item) => item.id !== testimonialId));
      setTestimonialStatus("Testimonial deleted successfully.");
    } catch (error) {
      setTestimonialStatus(error.response?.data?.message || "Testimonial delete failed.");
    }
  };

  return (
    <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="card-panel p-6 sm:p-8">
        <SectionHeader
          label="Testimonials"
          title="Testimonials management"
          description="Create, update, and delete testimonials shown on the public website."
        />

        <div className="mt-8 grid gap-8 xl:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-3xl border border-brand-border bg-brand-elevated p-6">
            <form onSubmit={submitTestimonial} className="grid gap-4">
              <input
                value={testimonialForm.name}
                onChange={(event) => setTestimonialForm({ ...testimonialForm, name: event.target.value })}
                placeholder="Name"
                required
              />
              <input
                value={testimonialForm.designation}
                onChange={(event) => setTestimonialForm({ ...testimonialForm, designation: event.target.value })}
                placeholder="Designation (optional)"
              />
              <textarea
                value={testimonialForm.message}
                onChange={(event) => setTestimonialForm({ ...testimonialForm, message: event.target.value })}
                placeholder="Message"
                rows="5"
                required
              />
              <div>
                <label className="mb-2 block text-sm font-medium text-brand-slate">Image (optional)</label>
                <input type="file" accept="image/*" onChange={(event) => setTestimonialForm({ ...testimonialForm, image: event.target.files?.[0] || null })} />
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="submit" className="button-primary">
                  {editingTestimonialId ? "Update Testimonial" : "Add Testimonial"}
                </button>
                {editingTestimonialId ? (
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => {
                      setEditingTestimonialId("");
                      setTestimonialForm(initialTestimonialForm);
                    }}
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
              {testimonialStatus ? <p className="text-sm text-brand-slate">{testimonialStatus}</p> : null}
            </form>
          </div>

          <div className="space-y-4">
            {testimonials.length ? (
              testimonials.map((item) => (
                <div key={item.id} className="rounded-3xl border border-brand-border bg-brand-surface p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-brand-ink">{item.name}</h3>
                      {item.designation ? <p className="mt-1 text-sm text-brand-slate">{item.designation}</p> : null}
                      <p className="mt-3 text-sm leading-7 text-brand-slate">"{item.message}"</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="button-soft px-4 py-2"
                        onClick={() => {
                          setEditingTestimonialId(item.id);
                          setTestimonialForm(mapTestimonialToForm(item));
                        }}
                      >
                        Edit
                      </button>
                      <button type="button" className="button-secondary px-4 py-2 text-rose-300" onClick={() => deleteTestimonial(item.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="No testimonials yet" description="Add testimonials here and they will appear on the public website." />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
