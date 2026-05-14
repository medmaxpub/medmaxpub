import { ArrowLeftRight, Archive, Eye, Pencil, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../api/client";
import EmptyState from "../../components/common/EmptyState";
import SectionHeader from "../../components/common/SectionHeader";
import ArticlePreviewModal from "../../components/user/ArticlePreviewModal";
import UserArticleForm from "../../components/user/UserArticleForm";
import {
  ARTICLE_STATUSES,
  buildArticleFormData,
  initialArticleForm,
  mapArticleToForm,
  stripHtml
} from "../../components/user/userPortalShared";
import useManagedJournal from "../../hooks/useManagedJournal";

function getWorkflowActions(status) {
  if (status === ARTICLE_STATUSES.IN_PRESS) {
    return [
      { key: "move-current", label: "Send to Current Issue", nextStatus: ARTICLE_STATUSES.CURRENT_ISSUE, icon: ArrowLeftRight },
      { key: "move-archive", label: "Move to Archive", nextStatus: ARTICLE_STATUSES.ARCHIVED, icon: Archive }
    ];
  }

  if (status === ARTICLE_STATUSES.CURRENT_ISSUE) {
    return [
      { key: "move-in-press", label: "Send back to Articles in Press", nextStatus: ARTICLE_STATUSES.IN_PRESS, icon: ArrowLeftRight },
      { key: "move-archive", label: "Send to Archive", nextStatus: ARTICLE_STATUSES.ARCHIVED, icon: Archive }
    ];
  }

  return [{ key: "restore-current", label: "Restore to Current Issue", nextStatus: ARTICLE_STATUSES.CURRENT_ISSUE, icon: ArrowLeftRight }];
}

export default function UserArticlesWorkspace({ status, title, description }) {
  const { journal, loading: journalLoading, error: journalError } = useManagedJournal();
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ ...initialArticleForm, status });
  const [editingArticleId, setEditingArticleId] = useState("");
  const [formStatus, setFormStatus] = useState("");
  const [tableStatus, setTableStatus] = useState("");
  const [previewArticle, setPreviewArticle] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadArticles = useCallback(async () => {
    if (!journal?.id) {
      setArticles([]);
      return;
    }

    try {
      const response = await api.get("/user/articles", {
        params: {
          status,
          search
        }
      });
      setArticles(response.data || []);
    } catch (error) {
      setArticles([]);
      setTableStatus(error.response?.data?.message || "Unable to load article records.");
    }
  }, [journal?.id, search, status]);

  useEffect(() => {
    setForm({ ...initialArticleForm, status });
    setEditingArticleId("");
    setFormStatus("");
    setTableStatus("");
  }, [status]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const workflowActions = useMemo(() => getWorkflowActions(status), [status]);

  const resetForm = () => {
    setEditingArticleId("");
    setForm({ ...initialArticleForm, status });
    setFormStatus("");
  };

  const startEdit = (article) => {
    setEditingArticleId(article.id);
    setForm({ ...mapArticleToForm(article), status: article.status || status });
    setFormStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitArticle = async (event) => {
    event.preventDefault();
    setFormStatus("");

    if (!journal?.id) {
      setFormStatus("This user does not have a journal assigned yet.");
      return;
    }

    if (!stripHtml(form.title) || !stripHtml(form.authorNames) || !stripHtml(form.citeAs) || !stripHtml(form.abstractText)) {
      setFormStatus("Please fill all rich text fields with actual content.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = buildArticleFormData(form, journal.id);

      if (editingArticleId) {
        await api.put(`/user/articles/${editingArticleId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        setFormStatus("Article updated successfully.");
      } else {
        await api.post("/articles", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        setFormStatus("Article created successfully.");
      }

      resetForm();
      await loadArticles();
    } catch (error) {
      setFormStatus(error.response?.data?.message || "Article save failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteArticle = async (article) => {
    const confirmed = window.confirm(`Delete article "${stripHtml(article.title)}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/user/articles/${article.id}`);
      setTableStatus("Article deleted successfully.");
      if (editingArticleId === article.id) {
        resetForm();
      }
      await loadArticles();
    } catch (error) {
      setTableStatus(error.response?.data?.message || "Article delete failed.");
    }
  };

  const moveArticle = async (article, nextStatus) => {
    try {
      await api.patch(`/user/articles/${article.id}/status`, { status: nextStatus });
      setTableStatus(`Article moved to ${nextStatus.replaceAll("_", " ")} successfully.`);
      if (editingArticleId === article.id) {
        resetForm();
      }
      await loadArticles();
    } catch (error) {
      setTableStatus(error.response?.data?.message || "Article movement failed.");
    }
  };

  if (journalLoading) {
    return <div className="container-shell py-10 text-sm text-brand-slate">Loading journal workspace...</div>;
  }

  if (!journal?.id) {
    return (
      <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="card-panel p-6 sm:p-8">
          <SectionHeader label={title} title="Journal workspace unavailable" description={journalError || "No managed journal is linked to this account yet."} />
          <div className="mt-6">
            <EmptyState
              title="No journal assigned"
              description="An admin must create your user account together with its journal before article workflow pages can be used."
            />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <UserArticleForm
        form={form}
        setForm={setForm}
        onSubmit={submitArticle}
        onReset={resetForm}
        submitLabel={isSubmitting ? "Saving..." : editingArticleId ? "Update Article" : "Save Article"}
        journalName={journal.managingJournalName}
        statusMessage={formStatus}
        isEditing={Boolean(editingArticleId)}
      />

      <section className="card-panel p-6 sm:p-8">
        <SectionHeader label={title} />

        <div className="mt-8 rounded-3xl border border-brand-border bg-brand-elevated p-4 sm:p-5">
          <div className="relative">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-slate" />
            <input
              className="pl-11"
              placeholder="Search article title, authors, keywords, or type"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-brand-border bg-brand-surface">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-brand-elevated text-brand-ink">
                <tr className="border-b border-brand-border">
                  <th className="px-4 py-4 font-semibold">Title</th>
                  <th className="px-4 py-4 font-semibold">Authors</th>
                  <th className="px-4 py-4 font-semibold">Issue</th>
                  <th className="px-4 py-4 font-semibold">Published</th>
                  <th className="px-4 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.length ? (
                  articles.map((article) => (
                    <tr key={article.id} className="border-b border-brand-border/60 text-brand-slate">
                      <td className="px-4 py-4">
                        <div className="font-medium text-brand-ink">{stripHtml(article.title)}</div>
                        <div className="mt-1 text-xs uppercase tracking-[0.16em] text-brand-teal">{article.articleType || "Article"}</div>
                      </td>
                      <td className="px-4 py-4">{stripHtml(article.authorNames) || "NA"}</td>
                      <td className="px-4 py-4">
                        Vol. {article.volume}, Issue {article.issueNumber}
                        <div className="mt-1 text-xs text-brand-slate">
                          {article.releaseMonth} {article.releaseYear}
                        </div>
                      </td>
                      <td className="px-4 py-4">{article.publishedDate?.slice?.(0, 10) || "NA"}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button type="button" className="button-soft min-h-10 px-3 py-2" onClick={() => setPreviewArticle(article)}>
                            <Eye size={16} className="mr-2" />
                            View
                          </button>
                          <button type="button" className="button-soft min-h-10 px-3 py-2" onClick={() => startEdit(article)}>
                            <Pencil size={16} className="mr-2" />
                            Edit
                          </button>
                          {workflowActions.map((action) => (
                            <button
                              key={action.key}
                              type="button"
                              className="button-secondary min-h-10 px-3 py-2"
                              onClick={() => moveArticle(article, action.nextStatus)}
                            >
                              <action.icon size={16} className="mr-2" />
                              {action.label}
                            </button>
                          ))}
                          <button type="button" className="button-secondary min-h-10 px-3 py-2 text-rose-300" onClick={() => deleteArticle(article)}>
                            <Trash2 size={16} className="mr-2" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-10">
                      <EmptyState
                        title={`No ${title.toLowerCase()} records`}
                        description="Create the first article entry with the form above or adjust your search terms."
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {tableStatus ? <p className="mt-4 text-sm text-brand-slate">{tableStatus}</p> : null}
      </section>

      <ArticlePreviewModal article={previewArticle} onClose={() => setPreviewArticle(null)} />
    </div>
  );
}
