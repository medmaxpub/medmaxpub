import { useCallback, useEffect, useState } from "react";
import api, { shouldUseDevelopmentFallback, withFallback } from "../../api/client";
import SectionHeader from "../../components/common/SectionHeader";
import useAutoRefresh from "../../hooks/useAutoRefresh";
import {
  getSuperUserJournalsFallback,
  getSuperUserTestimonialsFallback,
  getSuperUserUsersFallback
} from "./superUserFallbacks";

export default function SuperUserDashboardPage() {
  const [stats, setStats] = useState({ users: 0, journals: 0, testimonials: 0 });
  const useDevelopmentFallback = shouldUseDevelopmentFallback();

  const loadStats = useCallback(() => {
    return withFallback(
      () => api.get("/admin/dashboard-stats"),
      useDevelopmentFallback
        ? {
            users: getSuperUserUsersFallback().items?.length || 0,
            journals: getSuperUserJournalsFallback().length || 0,
            testimonials: getSuperUserTestimonialsFallback().length || 0
          }
        : { users: 0, journals: 0, testimonials: 0 }
    ).then((data) => {
      setStats({
        users: data.users || 0,
        journals: data.journals || 0,
        testimonials: data.testimonials || 0
      });
    });
  }, [useDevelopmentFallback]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useAutoRefresh(loadStats, { intervalMs: 60000 });

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
