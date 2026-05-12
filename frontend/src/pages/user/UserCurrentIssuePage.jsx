import { Archive, ArrowLeftRight, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";
import EmptyState from "../../components/common/EmptyState";
import SectionHeader from "../../components/common/SectionHeader";
import ArticlePreviewModal from "../../components/user/ArticlePreviewModal";
import ArticleWorkflowActions from "../../components/user/ArticleWorkflowActions";
import UserJournalSelector from "../../components/user/UserJournalSelector";
import { ARTICLE_STATUSES, stripHtml } from "../../components/user/userPortalShared";
import useManagedJournal from "../../hooks/useManagedJournal";

export default function UserCurrentIssuePage() {
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
  const [previewArticle, setPreviewArticle] = useState(null);

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
          status: ARTICLE_STATUSES.CURRENT_ISSUE,
          journalId: selectedJournalId
        }
      });
      setArticles(response.data || []);
    } catch (error) {
      setArticles([]);
      setStatusMessage(error.response?.data?.message || "Unable to load current issue articles.");
    }
  };

  useEffect(() => {
    loadArticles();
  }, [selectedJournalId]);

  const moveArticle = async (articleId, nextStatus, successMessage) => {
    try {
      await api.patch(`/user/articles/${articleId}/status`, { status: nextStatus });
      setStatusMessage(successMessage);
      await loadArticles();
    } catch (error) {
      setStatusMessage(error.response?.data?.message || "Article update failed.");
    }
  };

  const deleteArticle = async (article) => {
    const confirmed = window.confirm(`Delete article "${stripHtml(article.title)}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/user/articles/${article.id}`);
      setStatusMessage("Article deleted successfully.");
      await loadArticles();
    } catch (error) {
      setStatusMessage(error.response?.data?.message || "Article delete failed.");
    }
  };

  if (journalLoading) {
    return <div className="container-shell py-10 text-sm text-brand-slate">Loading journal workspace...</div>;
  }

  if (!journal?.id) {
    return (
      <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="card-panel p-6 sm:p-8">
          <SectionHeader
            label="Current Issue"
            title="Journal workspace unavailable"
            description={journalError || "No managed journal is linked to this account yet."}
          />
          <div className="mt-6">
            <EmptyState
              title="No journal assigned"
              description="Assign a journal to this user account first. Once a journal is linked, current issue pages will load automatically."
            />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="card-panel p-6 sm:p-8">
        <SectionHeader label="Current Issue" />

        <div className="mt-8 flex flex-col gap-4 border-b border-brand-border pb-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-brand-ink">Current Month is: "{currentMonthLabel}"</h3>
              <UserJournalSelector journals={journals} selectedJournalId={selectedJournalId} onChange={setSelectedJournalId} />
            </div>
            <button
              type="button"
              className="button-primary px-4 py-2"
              onClick={() =>
                navigate("/user/current-issue/add", {
                  state: {
                    journalId: selectedJournalId,
                    returnTo: "/user/current-issue"
                  }
                })
              }
            >
              <Plus size={16} className="mr-2" />
              Add Article
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-sky-400/30 bg-sky-400/15 px-4 py-3 text-sm text-sky-100">
          {articles.length
            ? `${articles.length} current issue article${articles.length === 1 ? "" : "s"} for ${journal?.managingJournalName || "the selected journal"}.`
            : "No Articles in the database"}
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-brand-border bg-brand-surface">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-brand-elevated text-brand-ink">
                <tr className="border-b border-brand-border">
                  <th className="px-4 py-4 font-semibold">id</th>
                  <th className="px-4 py-4 font-semibold">Title</th>
                  <th className="px-4 py-4 font-semibold">Volume , Issue</th>
                  <th className="px-4 py-4 font-semibold">month-year</th>
                  <th className="px-4 py-4 font-semibold">Status</th>
                  <th className="px-4 py-4 font-semibold">Workflow</th>
                  <th className="px-4 py-4 font-semibold">Edit</th>
                  <th className="px-4 py-4 font-semibold">Delete</th>
                </tr>
              </thead>
              <tbody>
                {articles.length ? (
                  articles.map((article, index) => (
                    <tr key={article.id} className="border-b border-brand-border/60 text-brand-slate align-top">
                      <td className="px-4 py-4">{index + 1}</td>
                      <td className="px-4 py-4">
                        <button type="button" className="text-left font-medium text-brand-teal hover:text-brand-ink" onClick={() => setPreviewArticle(article)}>
                          {stripHtml(article.title)}
                        </button>
                        <div className="mt-2">
                          <button type="button" className="text-xs text-brand-slate hover:text-brand-ink" onClick={() => setPreviewArticle(article)}>
                            <Eye size={13} className="mr-1 inline-block" />
                            View
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        Volume {article.volume}, Issue {article.issueNumber}
                      </td>
                      <td className="px-4 py-4">
                        {article.releaseMonth || "NA"}-{article.releaseYear || "NA"}
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-100">
                          Current Issue
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <ArticleWorkflowActions
                          actions={[
                            {
                              label: "Back to In Press",
                              icon: ArrowLeftRight,
                              onClick: () =>
                                moveArticle(article.id, ARTICLE_STATUSES.IN_PRESS, "Article sent back to articles in press successfully.")
                            },
                            {
                              label: "Move to Archive",
                              icon: Archive,
                              variant: "muted",
                              onClick: () => moveArticle(article.id, ARTICLE_STATUSES.ARCHIVED, "Article moved to archive successfully.")
                            }
                          ]}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          className="rounded-xl border border-brand-border bg-brand-elevated p-3 text-brand-ink hover:border-brand-teal hover:bg-brand-sky"
                          onClick={() =>
                            navigate(`/user/current-issue/${article.id}/edit`, {
                              state: {
                                journalId: selectedJournalId,
                                returnTo: "/user/current-issue"
                              }
                            })
                          }
                        >
                          <Pencil size={16} />
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          className="rounded-xl border border-brand-border bg-brand-elevated p-3 text-rose-300 hover:border-rose-400 hover:bg-rose-950/30"
                          onClick={() => deleteArticle(article)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-10">
                      <EmptyState
                        title="No current issue articles yet"
                        description="Use the Add Article button to create the first current issue record."
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {statusMessage ? <p className="mt-4 text-sm text-brand-slate">{statusMessage}</p> : null}
      </section>

      <ArticlePreviewModal article={previewArticle} onClose={() => setPreviewArticle(null)} />
    </div>
  );
}
