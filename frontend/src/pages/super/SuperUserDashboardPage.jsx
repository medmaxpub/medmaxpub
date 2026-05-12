import { useEffect, useState } from "react";
import api, { shouldUseDevelopmentFallback, withFallback } from "../../api/client";
import SectionHeader from "../../components/common/SectionHeader";
import {
  getSuperUserJournalsFallback,
  getSuperUserTestimonialsFallback,
  getSuperUserUsersFallback
} from "./superUserFallbacks";

export default function SuperUserDashboardPage() {
  const [stats, setStats] = useState({ users: 0, journals: 0, testimonials: 0 });
  const useDevelopmentFallback = shouldUseDevelopmentFallback();

  useEffect(() => {
    Promise.all([
      withFallback(() => api.get("/super/users", { params: { page: 1, pageSize: 1 } }), getSuperUserUsersFallback()),
      withFallback(() => api.get("/admin/journals"), useDevelopmentFallback ? getSuperUserJournalsFallback() : []),
      withFallback(() => api.get("/testimonials"), useDevelopmentFallback ? getSuperUserTestimonialsFallback() : [])
    ]).then(([usersData, journalsData, testimonialsData]) => {
      setStats({
        users: usersData?.meta?.total || usersData?.items?.length || 0,
        journals: journalsData.length || 0,
        testimonials: testimonialsData.length || 0
      });
    });
  }, [useDevelopmentFallback]);

  return (
    <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="card-panel p-6 sm:p-8">
        <SectionHeader
          label="Welcome"
          title="Super user control center"
          description="Review every user account, open dedicated management pages, and securely impersonate journal users when you need to maintain their publishing workspace."
        />

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-brand-border bg-brand-elevated p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-gold">Users</p>
            <p className="mt-3 text-3xl font-semibold text-brand-ink">{stats.users}</p>
          </div>
          <div className="rounded-3xl border border-brand-border bg-brand-elevated p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-gold">Journals</p>
            <p className="mt-3 text-3xl font-semibold text-brand-ink">{stats.journals}</p>
          </div>
          <div className="rounded-3xl border border-brand-border bg-brand-elevated p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-gold">Testimonials</p>
            <p className="mt-3 text-3xl font-semibold text-brand-ink">{stats.testimonials}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
