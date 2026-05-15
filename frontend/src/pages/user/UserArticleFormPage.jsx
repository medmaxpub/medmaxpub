import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../../api/client";
import RichTextEditor from "../../components/user/RichTextEditor";
import {
  accessTypeOptions,
  ARTICLE_STATUSES,
  buildArticleFormData,
  indexingLinkFields,
  initialArticleForm,
  mapArticleToForm,
  monthOptions,
  stripHtml
} from "../../components/user/userPortalShared";
import useManagedJournal from "../../hooks/useManagedJournal";

function LabelRow({ label, required = false, children }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[230px_1fr] lg:items-start">
      <div className="form-side-label" data-required={required ? "true" : undefined}>{label}</div>
      <div>{children}</div>
    </div>
  );
}

function getJournalId(journal) {
  return journal?.id || journal?._id || "";
}

export default function UserArticleFormPage({
  defaultStatus = ARTICLE_STATUSES.IN_PRESS,
  returnPath = "/user/articles-in-press",
  addHeading = "ADD Articles in press page",
  editHeading = "Edit Articles in press page",
  initialOverrides = null
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { articleId } = useParams();
  const isEditing = Boolean(articleId);
  const {
    journal,
    journals,
    selectedJournalId,
    setSelectedJournalId,
    loading: journalLoading,
    error: journalError
  } = useManagedJournal();
  const initialJournalId = location.state?.journalId || "";
  const resolvedReturnPath = location.state?.returnTo || returnPath;
  const resolvedInitialOverrides = location.state?.prefill || initialOverrides;
  const [form, setForm] = useState({ ...initialArticleForm, ...resolvedInitialOverrides, status: defaultStatus });
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingArticle, setLoadingArticle] = useState(isEditing);

  const currentYear = new Date().getFullYear();
  const releaseYears = Array.from({ length: 10 }, (_, index) => String(currentYear + 2 - index));

  const heading = useMemo(() => (isEditing ? editHeading : addHeading), [addHeading, editHeading, isEditing]);
  const activeJournal = useMemo(
    () => journals.find((item) => getJournalId(item) === selectedJournalId) || journal || null,
    [journal, journals, selectedJournalId]
  );

  useEffect(() => {
    if (!isEditing && initialJournalId) {
      setSelectedJournalId(initialJournalId);
    }
  }, [initialJournalId, isEditing, setSelectedJournalId]);

  useEffect(() => {
    const loadArticle = async () => {
      if (!articleId) {
        setLoadingArticle(false);
        return;
      }

      try {
        const response = await api.get(`/articles/${articleId}`);
        if (response.data?.journalId) {
          setSelectedJournalId(String(response.data.journalId));
        }
        setForm({
          ...initialArticleForm,
          ...resolvedInitialOverrides,
          ...mapArticleToForm(response.data),
          status: response.data.status || defaultStatus
        });
      } catch (error) {
        setStatusMessage(error.response?.data?.message || "Unable to load article details.");
      } finally {
        setLoadingArticle(false);
      }
    };

    loadArticle();
  }, [articleId, defaultStatus, resolvedInitialOverrides, setSelectedJournalId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatusMessage("");

    if (!getJournalId(activeJournal)) {
      setStatusMessage("This user does not have a journal assigned yet.");
      return;
    }

    if (!stripHtml(form.title) || !stripHtml(form.authorNames) || !stripHtml(form.citeAs) || !stripHtml(form.abstractText)) {
      setStatusMessage("Title, author names, citation text, and abstract must contain content.");
      return;
    }

    setIsSubmitting(true);

    try {
      const activeJournalId = getJournalId(activeJournal);
      const formData = buildArticleFormData(form, activeJournalId);

      if (isEditing) {
        await api.put(`/user/articles/${articleId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else {
        await api.post("/articles", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }

      navigate(resolvedReturnPath, {
        state: {
          journalId: activeJournalId
        }
      });
    } catch (error) {
      setStatusMessage(error.response?.data?.message || "Article save failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (journalLoading || loadingArticle) {
    return <div className="container-shell py-10 text-sm text-brand-slate">Loading article form...</div>;
  }

  return (
    <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="card-panel p-6 sm:p-8">
        <div className="flex flex-col gap-4 border-b border-brand-border pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {journalError ? <p className="mt-2 text-sm text-brand-slate">{journalError}</p> : null}
          </div>
          <p className="pt-2 text-xl text-brand-slate">{heading}</p>
        </div>

        <div className="mt-6">
          <button
            type="button"
            className="button-secondary px-4 py-2"
            onClick={() =>
              navigate(resolvedReturnPath, {
                state: {
                  journalId: getJournalId(activeJournal)
                }
              })
            }
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Articles
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <LabelRow label="Managing Journal" required>
            <select
              value={selectedJournalId}
              onChange={(event) => setSelectedJournalId(event.target.value)}
              disabled={isEditing}
              required
            >
              <option value="">Select journal</option>
              {journals.map((item) => (
                <option key={getJournalId(item)} value={getJournalId(item)}>
                  {item.managingJournalName || item.journalName || item.shortName || "Untitled Journal"}
                </option>
              ))}
            </select>
          </LabelRow>

          <LabelRow label="Article Access Type" required>
            <select value={form.accessType} onChange={(event) => setForm((current) => ({ ...current, accessType: event.target.value }))} required>
              <option value="">Select Access type</option>
              {accessTypeOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </LabelRow>

          <div className="grid gap-5 lg:grid-cols-[230px_1fr] lg:items-start">
            <div className="form-side-label" data-required="true">Volume and Issue no</div>
            <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  type="number"
                  min="1"
                  placeholder="Volume no"
                  value={form.volume}
                  onChange={(event) => setForm((current) => ({ ...current, volume: event.target.value }))}
                  required
                />
                <input
                  type="number"
                  min="1"
                  placeholder="Issue no"
                  value={form.issueNumber}
                  onChange={(event) => setForm((current) => ({ ...current, issueNumber: event.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <select
                  value={form.releaseMonth}
                  onChange={(event) => setForm((current) => ({ ...current, releaseMonth: event.target.value }))}
                  required
                >
                  <option value="">Select month</option>
                  {monthOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <select
                  value={form.releaseYear}
                  onChange={(event) => setForm((current) => ({ ...current, releaseYear: event.target.value }))}
                  required
                >
                  <option value="">year</option>
                  {releaseYears.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <LabelRow label="Special Issue Title">
            <input
              placeholder="Special Issue Title"
              value={form.specialIssueTitle}
              onChange={(event) => setForm((current) => ({ ...current, specialIssueTitle: event.target.value }))}
            />
          </LabelRow>

          <LabelRow label="Article Type">
            <input
              placeholder="Enter Article Type"
              value={form.articleType}
              onChange={(event) => setForm((current) => ({ ...current, articleType: event.target.value }))}
            />
          </LabelRow>

          <LabelRow label="Upload PDF">
            <input type="file" accept=".pdf" onChange={(event) => setForm((current) => ({ ...current, pdfFile: event.target.files?.[0] || null }))} />
          </LabelRow>

          <LabelRow label="Article Title" required>
            <RichTextEditor
              label=""
              value={form.title}
              onChange={(value) => setForm((current) => ({ ...current, title: value }))}
              required
              placeholder="Enter article title"
            />
          </LabelRow>

          <LabelRow label="Author Names" required>
            <RichTextEditor
              label=""
              value={form.authorNames}
              onChange={(value) => setForm((current) => ({ ...current, authorNames: value }))}
              required
              placeholder="Enter author names"
            />
          </LabelRow>

          <div className="grid gap-5 lg:grid-cols-[230px_1fr] lg:items-start">
            <div className="form-side-label" data-required="true">Corresponding Author&apos;s Email</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="form-label" data-required="true">Corresponding Author&apos;s Email</label>
                <input
                  type="email"
                  placeholder="Enter corresponding author's email"
                  value={form.correspondingAuthorEmail}
                  onChange={(event) => setForm((current) => ({ ...current, correspondingAuthorEmail: event.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="form-label" data-required="true">Keywords</label>
                <input
                  placeholder="Enter Keywords"
                  value={form.keywords}
                  onChange={(event) => setForm((current) => ({ ...current, keywords: event.target.value }))}
                  required
                />
              </div>
            </div>
          </div>

          <LabelRow label="Cite this article As" required>
            <RichTextEditor
              label=""
              value={form.citeAs}
              onChange={(value) => setForm((current) => ({ ...current, citeAs: value }))}
              required
              placeholder="Enter citation text"
            />
          </LabelRow>

          <div className="grid gap-5 lg:grid-cols-[230px_1fr] lg:items-start">
            <div className="form-side-label" data-required="true">Enter First Page Number</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="form-label" data-required="true">Enter First Page Number</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Enter First Page Number.."
                  value={form.firstPageNumber}
                  onChange={(event) => setForm((current) => ({ ...current, firstPageNumber: event.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="form-label" data-required="true">Enter Last Page Number</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Enter Last Page Number.."
                  value={form.lastPageNumber}
                  onChange={(event) => setForm((current) => ({ ...current, lastPageNumber: event.target.value }))}
                  required
                />
              </div>
            </div>
          </div>

          <LabelRow label="Enter Doi Number">
            <input
              placeholder="Enter Doi Number.."
              value={form.doiNumber}
              onChange={(event) => setForm((current) => ({ ...current, doiNumber: event.target.value }))}
            />
          </LabelRow>

          <LabelRow label="Enter Abstract" required>
            <RichTextEditor
              label=""
              value={form.abstractText}
              onChange={(value) => setForm((current) => ({ ...current, abstractText: value }))}
              required
              placeholder="Enter abstract"
            />
          </LabelRow>

          <div className="grid gap-5 lg:grid-cols-[230px_1fr] lg:items-start">
            <div className="form-side-label" data-required="true">Country</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="form-label" data-required="true">Country</label>
                <input value={form.country} onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))} required />
              </div>
              <div>
                <label className="form-label" data-required="true">Select Article Published Date</label>
                <input
                  type="date"
                  value={form.publishedDate}
                  onChange={(event) => setForm((current) => ({ ...current, publishedDate: event.target.value }))}
                  required
                />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-brand-border bg-brand-elevated p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-teal">Optional Indexing Links</p>
            <div className="mt-5 grid gap-5">
          {indexingLinkFields.map((item) => (
              <LabelRow key={item.key} label={item.label}>
              <input
                type="url"
                placeholder={`Enter Article's ${item.label}`}
                value={form.indexingLinks[item.key]}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    indexingLinks: {
                      ...current.indexingLinks,
                      [item.key]: event.target.value
                    }
                  }))
                }
              />
              </LabelRow>
          ))}
            </div>
          </div>

          <LabelRow label="Enter Supplimentory file">
            <div className="grid gap-4 md:grid-cols-2">
              <input
                type="file"
                onChange={(event) => setForm((current) => ({ ...current, supplementaryFileOne: event.target.files?.[0] || null }))}
              />
              <input
                type="file"
                onChange={(event) => setForm((current) => ({ ...current, supplementaryFileTwo: event.target.files?.[0] || null }))}
              />
            </div>
          </LabelRow>

          {statusMessage ? <p className="text-sm text-brand-slate">{statusMessage}</p> : null}

          <button type="submit" className="button-primary px-5 py-3" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Submit"}
          </button>
        </form>
      </section>
    </div>
  );
}
