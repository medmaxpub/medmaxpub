import { useEffect, useState } from "react";
import api from "../../api/client";
import SectionHeader from "../../components/common/SectionHeader";
import { ARTICLE_STATUSES } from "../../components/user/userPortalShared";

export default function UserWelcomePage() {
  const [stats, setStats] = useState({
    inPress: 0,
    currentIssue: 0,
    archived: 0,
    editorialBoard: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [inPress, currentIssue, archived, editorialBoard] = await Promise.all([
          api.get("/user/articles", { params: { status: ARTICLE_STATUSES.IN_PRESS } }),
          api.get("/user/articles", { params: { status: ARTICLE_STATUSES.CURRENT_ISSUE } }),
          api.get("/user/articles", { params: { status: ARTICLE_STATUSES.ARCHIVED } }),
          api.get("/user/editorial-board")
        ]);

        setStats({
          inPress: (inPress.data || []).length,
          currentIssue: (currentIssue.data || []).length,
          archived: (archived.data || []).length,
          editorialBoard: (editorialBoard.data || []).length
        });
      } catch {
        setStats({
          inPress: 0,
          currentIssue: 0,
          archived: 0,
          editorialBoard: 0
        });
      }
    };

    loadStats();
  }, []);

  return (
    <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="card-panel p-6 sm:p-8">
        <SectionHeader label="Welcome" />

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-brand-border bg-brand-elevated p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-gold">Articles in Press</p>
            <p className="mt-3 text-3xl font-semibold text-brand-ink">{stats.inPress}</p>
          </div>
          <div className="rounded-3xl border border-brand-border bg-brand-elevated p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-gold">Current Issue</p>
            <p className="mt-3 text-3xl font-semibold text-brand-ink">{stats.currentIssue}</p>
          </div>
          <div className="rounded-3xl border border-brand-border bg-brand-elevated p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-gold">Archive Pages</p>
            <p className="mt-3 text-3xl font-semibold text-brand-ink">{stats.archived}</p>
          </div>
          <div className="rounded-3xl border border-brand-border bg-brand-elevated p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-gold">Editorial Board</p>
            <p className="mt-3 text-3xl font-semibold text-brand-ink">{stats.editorialBoard}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
