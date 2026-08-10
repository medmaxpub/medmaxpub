import { FileText } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { cachedGet, shouldUseDevelopmentFallback, withFallback } from "../../api/client";
import EmptyState from "../../components/common/EmptyState";
import useAutoRefresh from "../../hooks/useAutoRefresh";
import { mockJournals } from "../../data/mockData";
import { getJournalRouteSlug, slugifyTitle } from "../../utils/journalLinks";
import { buildArticlePdfFileUrl } from "../../utils/pdfProxy";

function hasHtmlContent(value) {
  return /<\/?[a-z][\s\S]*>/i.test(String(value || ""));
}

function formatPublishedDate(value) {
  if (!value) return "NA";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value).slice(0, 10) || "NA";
  return parsed.toISOString().slice(0, 10);
}

function resolveAuthorText(article) {
  if (article?.authorNames) return stripHtml(article.authorNames);
  if (Array.isArray(article?.authors) && article.authors.length) return stripHtml(article.authors.join(", "));
  return "NA";
}

function stripHtml(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function matchesArticle(item, param) {
  return (
    String(item.id) === String(param) ||
    slugifyTitle(stripHtml(item.title)) === String(param)
  );
}

function findArticleInJournal(journal, articleId) {
  const inPressMatch = (journal?.inPressArticles || []).find((item) => matchesArticle(item, articleId));
  if (inPressMatch) return inPressMatch;

  const currentIssueMatch = (journal?.currentIssue?.articles || []).find((item) => matchesArticle(item, articleId));
  if (currentIssueMatch) return currentIssueMatch;

  for (const year of journal?.archive || []) {
    for (const volume of year.volumes || []) {
      for (const issue of volume.issues || []) {
        const archiveMatch = (issue.articles || []).find((item) => matchesArticle(item, articleId));
        if (archiveMatch) return archiveMatch;
      }
    }
  }

  return null;
}

export default function JournalArticleAbstractPage() {
  const { journalUrl, articleId } = useParams();
  const [journal, setJournal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const useDevelopmentFallback = shouldUseDevelopmentFallback();

  const loadJournal = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setIsLoading(true);

    const data = await withFallback(
      () => cachedGet(`/journals/${journalUrl}`, {}, { ttlMs: 15000 }),
      useDevelopmentFallback
        ? mockJournals.find((item) => getJournalRouteSlug(item.publicJournalUrl || item.journalUrl) === journalUrl)
        : null
    );

    if (data || !silent) setJournal(data);
    if (!silent) setIsLoading(false);
  }, [journalUrl, useDevelopmentFallback]);

  useEffect(() => {
    loadJournal();
  }, [loadJournal]);

  useAutoRefresh(() => loadJournal({ silent: true }), {
    enabled: !useDevelopmentFallback,
    intervalMs: 0
  });

  const article = useMemo(() => findArticleInJournal(journal, articleId), [articleId, journal]);

  const articleTitle = article ? stripHtml(article.title) || "Untitled article" : "";

  // ✅ Browser tab shows the article title, same as the PDF viewer does
  useEffect(() => {
    if (articleTitle) {
      document.title = articleTitle;
    }
  }, [articleTitle]);

  if (isLoading) return null;

  if (!journal) {
    return (
      <div className="min-h-screen bg-white px-5 py-16">
        <div className="mx-auto max-w-4xl">
          <EmptyState title="Journal not found" description="The selected journal record could not be loaded." />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-white px-5 py-16">
        <div className="mx-auto max-w-4xl">
          <EmptyState title="Article not found" description="The selected abstract could not be loaded for this journal." />
        </div>
      </div>
    );
  }

  const pdfFileUrl = article.pdfUrl ? buildArticlePdfFileUrl(article) : null;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
        <p className="text-xs uppercase tracking-[0.18em] text-brand-teal">{article.articleType || "Article"}</p>

        <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-brand-ink sm:text-4xl">
          {articleTitle}
        </h1>

        <div className="mt-6 grid gap-3 text-sm text-brand-slate sm:grid-cols-2">
          <p><span className="font-semibold text-brand-ink">Author:</span> {resolveAuthorText(article)}</p>
          <p><span className="font-semibold text-brand-ink">Publication Date:</span> {formatPublishedDate(article.publishedDate)}</p>
          <p><span className="font-semibold text-brand-ink">DOI:</span> {article.doiNumber || "NA"}</p>
          <p><span className="font-semibold text-brand-ink">Country:</span> {article.country || "NA"}</p>
        </div>

        {pdfFileUrl ? (
          <div className="mt-6">
            <a
              href={pdfFileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-[linear-gradient(135deg,#fff8f8_0%,#ffe9e9_100%)] px-4 py-2 text-sm font-semibold text-rose-600 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-400 hover:shadow-md"
            >
              <FileText size={15} />
              Open PDF
            </a>
          </div>
        ) : null}

        <hr className="mt-8 border-brand-border" />

        <div className="mt-8">
          <p className="text-xs uppercase tracking-[0.18em] text-brand-gold">Abstract</p>
          {hasHtmlContent(article.abstractText) ? (
            <div
              className="rich-copy mt-4 text-brand-slate"
              dangerouslySetInnerHTML={{ __html: article.abstractText || "<p>Not available.</p>" }}
            />
          ) : (
            <p className="mt-4 whitespace-pre-line leading-8 text-brand-slate">
              {article.abstractText || "Abstract not available."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
// // import { ArrowLeft, FileText } from "lucide-react";
// // import { useCallback, useEffect, useMemo, useState } from "react";
// // import { Link, useLocation, useParams } from "react-router-dom";
// // import { cachedGet, shouldUseDevelopmentFallback, withFallback } from "../../api/client";
// // import EmptyState from "../../components/common/EmptyState";
// // import JournalMenu from "../../components/journal/JournalMenu";
// // import useAutoRefresh from "../../hooks/useAutoRefresh";
// // import { mockJournals } from "../../data/mockData";
// // import { buildPdfProxyUrl } from "../../utils/pdfProxy";
// // import { buildJournalSectionPath, getJournalRouteSlug } from "../../utils/journalLinks";

// // function hasHtmlContent(value) {
// //   return /<\/?[a-z][\s\S]*>/i.test(String(value || ""));
// // }

// // function formatPublishedDate(value) {
// //   if (!value) {
// //     return "NA";
// //   }

// //   const parsed = new Date(value);

// //   if (Number.isNaN(parsed.getTime())) {
// //     return String(value).slice(0, 10) || "NA";
// //   }

// //   return parsed.toISOString().slice(0, 10);
// // }

// // function resolveAuthorText(article) {
// //   if (article?.authorNames) {
// //     return stripHtml(article.authorNames);
// //   }

// //   if (Array.isArray(article?.authors) && article.authors.length) {
// //     return stripHtml(article.authors.join(", "));
// //   }

// //   return "NA";
// // }

// // function stripHtml(value) {
// //   return String(value || "")
// //     .replace(/<[^>]*>/g, " ")
// //     .replace(/&nbsp;/gi, " ")
// //     .replace(/\s+/g, " ")
// //     .trim();
// // }

// // function findArticleInJournal(journal, articleId) {
// //   const inPressMatch = (journal?.inPressArticles || []).find((item) => String(item.id) === String(articleId));

// //   if (inPressMatch) {
// //     return inPressMatch;
// //   }

// //   const currentIssueMatch = (journal?.currentIssue?.articles || []).find((item) => String(item.id) === String(articleId));

// //   if (currentIssueMatch) {
// //     return currentIssueMatch;
// //   }

// //   for (const year of journal?.archive || []) {
// //     for (const volume of year.volumes || []) {
// //       for (const issue of volume.issues || []) {
// //         const archiveMatch = (issue.articles || []).find((item) => String(item.id) === String(articleId));

// //         if (archiveMatch) {
// //           return archiveMatch;
// //         }
// //       }
// //     }
// //   }

// //   return null;
// // }

// // export default function JournalArticleAbstractPage() {
// //   const { journalUrl, articleId } = useParams();
// //   const location = useLocation();
// //   const [journal, setJournal] = useState(null);
// //   const [isLoading, setIsLoading] = useState(true);
// //   const useDevelopmentFallback = shouldUseDevelopmentFallback();

// //   const loadJournal = useCallback(async ({ silent = false } = {}) => {
// //     if (!silent) {
// //       setIsLoading(true);
// //     }

// //     const data = await withFallback(
// //       () => cachedGet(`/journals/${journalUrl}`, {}, { ttlMs: 15000 }),
// //       useDevelopmentFallback
// //         ? mockJournals.find((item) => getJournalRouteSlug(item.publicJournalUrl || item.journalUrl) === journalUrl)
// //         : null
// //     );

// //     if (data || !silent) {
// //       setJournal(data);
// //     }

// //     if (!silent) {
// //       setIsLoading(false);
// //     }
// //   }, [journalUrl, useDevelopmentFallback]);

// //   useEffect(() => {
// //     loadJournal();
// //   }, [loadJournal]);

// //   useAutoRefresh(() => loadJournal({ silent: true }), {
// //     enabled: !useDevelopmentFallback,
// //     intervalMs: 0
// //   });

// //   const article = useMemo(() => {
// //     if (location.state?.article && String(location.state.article.id) === String(articleId)) {
// //       return location.state.article;
// //     }

// //     return findArticleInJournal(journal, articleId);
// //   }, [articleId, journal, location.state]);

// //   if (isLoading) {
// //     return null;
// //   }

// //   if (!journal) {
// //     return (
// //       <div className="section-shell">
// //         <div className="container-shell">
// //           <EmptyState title="Journal not found" description="The selected journal record could not be loaded." />
// //         </div>
// //       </div>
// //     );
// //   }

// //   if (!article) {
// //     return (
// //       <div className="section-shell">
// //         <div className="container-shell">
// //           <EmptyState title="Article not found" description="The selected abstract could not be loaded for this journal." />
// //         </div>
// //       </div>
// //     );
// //   }

// //   const pdfUrl = article.pdfUrl ? buildPdfProxyUrl(article.pdfUrl) || article.pdfUrl : "";
// //   const articleTitle = stripHtml(article.title) || "Untitled article";

// //   return (
// //     <div className="section-shell">
// //       <div className="container-shell space-y-8">
// //         <div className="card-panel overflow-hidden">
// //           <div className="border-b border-brand-border px-5 py-5 sm:px-8 sm:py-6">
// //             <JournalMenu journalUrl={journal.publicJournalUrl || journal.journalUrl} />
// //           </div>

// //           <div className="p-5 sm:p-8">
// //             <div className="flex flex-wrap items-center gap-3">
// //               <Link to={buildJournalSectionPath(journal.publicJournalUrl || journal.journalUrl, "article-in-press")} className="button-secondary px-4 py-2">
// //                 <ArrowLeft size={16} className="mr-2" />
// //                 Back to Article in Press
// //               </Link>
// //               {pdfUrl ? (
// //                 <a href={pdfUrl} target="_blank" rel="noreferrer" className="button-soft px-4 py-2">
// //                   <FileText size={16} className="mr-2" />
// //                   Open PDF
// //                 </a>
// //               ) : null}
// //             </div>

// //             <div className="mt-8 rounded-3xl border border-brand-border bg-brand-surface p-6 sm:p-8">
// //               <p className="text-xs uppercase tracking-[0.18em] text-brand-teal">{article.articleType || "Article"}</p>
// //               <h1 className="mt-3 font-display text-3xl font-semibold text-brand-ink sm:text-4xl">{articleTitle}</h1>

// //               <div className="mt-5 grid gap-4 text-sm text-brand-slate md:grid-cols-2">
// //                 <p><span className="font-semibold text-brand-ink">Author:</span> {resolveAuthorText(article)}</p>
// //                 <p><span className="font-semibold text-brand-ink">Publication Date:</span> {formatPublishedDate(article.publishedDate)}</p>
// //                 <p><span className="font-semibold text-brand-ink">DOI:</span> {article.doiNumber || "NA"}</p>
// //                 <p><span className="font-semibold text-brand-ink">Country:</span> {article.country || "NA"}</p>
// //               </div>

// //               <div className="mt-8">
// //                 <p className="text-xs uppercase tracking-[0.18em] text-brand-gold">Abstract</p>
// //                 {hasHtmlContent(article.abstractText) ? (
// //                   <div className="rich-copy mt-4 text-brand-slate" dangerouslySetInnerHTML={{ __html: article.abstractText || "<p>Not available.</p>" }} />
// //                 ) : (
// //                   <p className="mt-4 whitespace-pre-line leading-8 text-brand-slate">{article.abstractText || "Abstract not available."}</p>
// //                 )}
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }
// import { ArrowLeft, FileText } from "lucide-react";
// import { useCallback, useEffect, useMemo, useState } from "react";
// import { Link, useLocation, useParams } from "react-router-dom";
// import { cachedGet, shouldUseDevelopmentFallback, withFallback } from "../../api/client";
// import EmptyState from "../../components/common/EmptyState";
// import JournalMenu from "../../components/journal/JournalMenu";
// import useAutoRefresh from "../../hooks/useAutoRefresh";
// import { mockJournals } from "../../data/mockData";
// import { buildPdfProxyUrl } from "../../utils/pdfProxy";
// import { buildJournalSectionPath, getJournalRouteSlug } from "../../utils/journalLinks";

// function hasHtmlContent(value) {
//   return /<\/?[a-z][\s\S]*>/i.test(String(value || ""));
// }

// function formatPublishedDate(value) {
//   if (!value) {
//     return "NA";
//   }

//   const parsed = new Date(value);

//   if (Number.isNaN(parsed.getTime())) {
//     return String(value).slice(0, 10) || "NA";
//   }

//   return parsed.toISOString().slice(0, 10);
// }

// function resolveAuthorText(article) {
//   if (article?.authorNames) {
//     return stripHtml(article.authorNames);
//   }

//   if (Array.isArray(article?.authors) && article.authors.length) {
//     return stripHtml(article.authors.join(", "));
//   }

//   return "NA";
// }

// function stripHtml(value) {
//   return String(value || "")
//     .replace(/<[^>]*>/g, " ")
//     .replace(/&nbsp;/gi, " ")
//     .replace(/\s+/g, " ")
//     .trim();
// }

// function findArticleInJournal(journal, articleId) {
//   const inPressMatch = (journal?.inPressArticles || []).find((item) => String(item.id) === String(articleId));

//   if (inPressMatch) {
//     return inPressMatch;
//   }

//   const currentIssueMatch = (journal?.currentIssue?.articles || []).find((item) => String(item.id) === String(articleId));

//   if (currentIssueMatch) {
//     return currentIssueMatch;
//   }

//   for (const year of journal?.archive || []) {
//     for (const volume of year.volumes || []) {
//       for (const issue of volume.issues || []) {
//         const archiveMatch = (issue.articles || []).find((item) => String(item.id) === String(articleId));

//         if (archiveMatch) {
//           return archiveMatch;
//         }
//       }
//     }
//   }

//   return null;
// }

// export default function JournalArticleAbstractPage() {
//   const { journalUrl, articleId } = useParams();
//   const location = useLocation();
//   const [journal, setJournal] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const useDevelopmentFallback = shouldUseDevelopmentFallback();

//   const loadJournal = useCallback(async ({ silent = false } = {}) => {
//     if (!silent) {
//       setIsLoading(true);
//     }

//     const data = await withFallback(
//       () => cachedGet(`/journals/${journalUrl}`, {}, { ttlMs: 15000 }),
//       useDevelopmentFallback
//         ? mockJournals.find((item) => getJournalRouteSlug(item.publicJournalUrl || item.journalUrl) === journalUrl)
//         : null
//     );

//     if (data || !silent) {
//       setJournal(data);
//     }

//     if (!silent) {
//       setIsLoading(false);
//     }
//   }, [journalUrl, useDevelopmentFallback]);

//   useEffect(() => {
//     loadJournal();
//   }, [loadJournal]);

//   useAutoRefresh(() => loadJournal({ silent: true }), {
//     enabled: !useDevelopmentFallback,
//     intervalMs: 0
//   });

//   const article = useMemo(() => {
//     if (location.state?.article && String(location.state.article.id) === String(articleId)) {
//       return location.state.article;
//     }

//     return findArticleInJournal(journal, articleId);
//   }, [articleId, journal, location.state]);

//   if (isLoading) {
//     return null;
//   }

//   if (!journal) {
//     return (
//       <div className="section-shell">
//         <div className="container-shell">
//           <EmptyState title="Journal not found" description="The selected journal record could not be loaded." />
//         </div>
//       </div>
//     );
//   }

//   if (!article) {
//     return (
//       <div className="section-shell">
//         <div className="container-shell">
//           <EmptyState title="Article not found" description="The selected abstract could not be loaded for this journal." />
//         </div>
//       </div>
//     );
//   }

//   const articleTitle = stripHtml(article.title) || "Untitled article";

//   // ✅ Pass the article title as the filename so the PDF saves with a meaningful name
//   const pdfUrl = article.pdfUrl
//     ? buildPdfProxyUrl(article.pdfUrl, { filename: articleTitle }) || article.pdfUrl
//     : "";

//   return (
//     <div className="section-shell">
//       <div className="container-shell space-y-8">
//         <div className="card-panel overflow-hidden">
//           <div className="border-b border-brand-border px-5 py-5 sm:px-8 sm:py-6">
//             <JournalMenu journalUrl={journal.publicJournalUrl || journal.journalUrl} />
//           </div>

//           <div className="p-5 sm:p-8">
//             <div className="flex flex-wrap items-center gap-3">
//               <Link to={buildJournalSectionPath(journal.publicJournalUrl || journal.journalUrl, "article-in-press")} className="button-secondary px-4 py-2">
//                 <ArrowLeft size={16} className="mr-2" />
//                 Back to Article in Press
//               </Link>
//               {pdfUrl ? (
//                 <a href={pdfUrl} target="_blank" rel="noreferrer" className="button-soft px-4 py-2">
//                   <FileText size={16} className="mr-2" />
//                   Open PDF
//                 </a>
//               ) : null}
//             </div>

//             <div className="mt-8 rounded-3xl border border-brand-border bg-brand-surface p-6 sm:p-8">
//               <p className="text-xs uppercase tracking-[0.18em] text-brand-teal">{article.articleType || "Article"}</p>
//               <h1 className="mt-3 font-display text-3xl font-semibold text-brand-ink sm:text-4xl">{articleTitle}</h1>

//               <div className="mt-5 grid gap-4 text-sm text-brand-slate md:grid-cols-2">
//                 <p><span className="font-semibold text-brand-ink">Author:</span> {resolveAuthorText(article)}</p>
//                 <p><span className="font-semibold text-brand-ink">Publication Date:</span> {formatPublishedDate(article.publishedDate)}</p>
//                 <p><span className="font-semibold text-brand-ink">DOI:</span> {article.doiNumber || "NA"}</p>
//                 <p><span className="font-semibold text-brand-ink">Country:</span> {article.country || "NA"}</p>
//               </div>

//               <div className="mt-8">
//                 <p className="text-xs uppercase tracking-[0.18em] text-brand-gold">Abstract</p>
//                 {hasHtmlContent(article.abstractText) ? (
//                   <div className="rich-copy mt-4 text-brand-slate" dangerouslySetInnerHTML={{ __html: article.abstractText || "<p>Not available.</p>" }} />
//                 ) : (
//                   <p className="mt-4 whitespace-pre-line leading-8 text-brand-slate">{article.abstractText || "Abstract not available."}</p>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
