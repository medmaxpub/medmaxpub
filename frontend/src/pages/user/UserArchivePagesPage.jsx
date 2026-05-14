import { FileText, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/client";
import EmptyState from "../../components/common/EmptyState";
import SectionHeader from "../../components/common/SectionHeader";
import JournalPdfUploadModal from "../../components/user/JournalPdfUploadModal";
import UserJournalSelector from "../../components/user/UserJournalSelector";
import { ARTICLE_STATUSES } from "../../components/user/userPortalShared";
import useManagedJournal from "../../hooks/useManagedJournal";

function groupArchiveArticles(articles) {
  const yearMap = new Map();

  articles.forEach((article) => {
    const year = String(article.releaseYear || "Unknown");
    const issueKey = `${article.volume || "NA"}-${article.issueNumber || "NA"}`;
    const yearEntry = yearMap.get(year) || new Map();

    if (!yearEntry.has(issueKey)) {
      yearEntry.set(issueKey, {
        year,
        volume: article.volume || "",
        issueNumber: article.issueNumber || "",
        releaseMonth: article.releaseMonth || "",
        count: 0
      });
    }

    yearEntry.get(issueKey).count += 1;
    yearMap.set(year, yearEntry);
  });

  return [...yearMap.entries()]
    .sort((left, right) => Number(right[0]) - Number(left[0]))
    .map(([year, issuesMap]) => ({
      year,
      issues: [...issuesMap.values()].sort((left, right) => {
        if (left.volume !== right.volume) {
          return Number(right.volume) - Number(left.volume);
        }

        return Number(right.issueNumber) - Number(left.issueNumber);
      })
    }));
}

export default function UserArchivePagesPage() {
  const navigate = useNavigate();
  const {
    journal,
    journals,
    selectedJournalId,
    setSelectedJournalId,
    loading: journalLoading,
    error: journalError
  } = useManagedJournal();
  const [articles, setArticles] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [pdfModalOpen, setPdfModalOpen] = useState(false);

  const currentMonthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric"
  }).format(new Date());

  const loadArticles = async () => {
    if (!selectedJournalId) {
      setArticles([]);
      return;
    }

    try {
      const response = await api.get("/user/articles", {
        params: {
          status: ARTICLE_STATUSES.ARCHIVED,
          journalId: selectedJournalId
        }
      });
      setArticles(response.data || []);
    } catch (error) {
      setArticles([]);
      setStatusMessage(error.response?.data?.message || "Unable to load archive pages.");
    }
  };

  useEffect(() => {
    loadArticles();
  }, [selectedJournalId]);

  const groupedArchive = useMemo(() => groupArchiveArticles(articles), [articles]);

  if (journalLoading) {
    return <div className="container-shell py-10 text-sm text-brand-slate">Loading journal workspace...</div>;
  }

  if (!journal?.id) {
    return (
      <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="card-panel p-6 sm:p-8">
          <SectionHeader
            label="Archive Pages"
            title="Journal workspace unavailable"
            description={journalError || "No managed journal is linked to this account yet."}
          />
          <div className="mt-6">
            <EmptyState
              title="No journal assigned"
              description="An admin must create your user account together with its journal before archive pages can be used."
            />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="card-panel p-6 sm:p-8">
        <SectionHeader label="Archive Pages" />

        <div className="mt-8 flex flex-col gap-4 border-b border-brand-border pb-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-brand-ink">Current Month is: "{currentMonthLabel}"</h3>
              <UserJournalSelector journals={journals} selectedJournalId={selectedJournalId} onChange={setSelectedJournalId} />
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" className="button-secondary px-4 py-2" onClick={() => setPdfModalOpen(true)}>
                <FileText size={16} className="mr-2" />
                Add PDF
              </button>
              <button
                type="button"
                className="button-primary px-4 py-2"
                onClick={() =>
                  navigate("/user/archive-pages/add", {
                    state: {
                      journalId: selectedJournalId,
                      returnTo: "/user/archive-pages"
                    }
                  })
                }
              >
                <Plus size={16} className="mr-2" />
                Add Article
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-8">
          {groupedArchive.length ? (
            groupedArchive.map((yearBlock) => (
              <div key={yearBlock.year}>
                <h4 className="text-lg font-semibold text-brand-ink">{yearBlock.year}</h4>
                <div className="mt-4 flex flex-wrap gap-3">
                  {yearBlock.issues.map((issue) => (
                    <Link
                      key={`${yearBlock.year}-${issue.volume}-${issue.issueNumber}`}
                      to={`/user/archive-pages/issue/${yearBlock.year}/${issue.volume}/${issue.issueNumber}`}
                      className="inline-flex rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white hover:bg-brand-elevated"
                    >
                      Volume {issue.volume} Issue{issue.issueNumber}
                    </Link>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              title="No archive issues yet"
              description="Archived issues will appear here grouped by publication year once articles are moved into archive."
            />
          )}
        </div>

        {statusMessage ? <p className="mt-4 text-sm text-brand-slate">{statusMessage}</p> : null}
      </section>

      <JournalPdfUploadModal
        open={pdfModalOpen}
        journalId={selectedJournalId}
        journalName={journal?.managingJournalName}
        onClose={() => setPdfModalOpen(false)}
        onUploaded={(message) => setStatusMessage(message)}
      />
    </div>
  );
}
