import { FileText, ScrollText } from "lucide-react";
import { buildJournalArticleAbstractPath } from "../../utils/journalLinks";
import { buildArticlePdfFileUrl } from "../../utils/pdfProxy";

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

export default function PublicArticleCard({ article, journalRoute, articleKey }) {
  const articleTitle = stripHtml(article.title) || "Untitled article";

  // ✅ Abstract page URL
  const abstractPath = buildJournalArticleAbstractPath(journalRoute, article.id, articleTitle);

  // ✅ PDF points at a real .pdf file URL — the browser's native viewer opens it
  const pdfFileUrl = article.pdfUrl ? buildArticlePdfFileUrl(article) : null;

  return (
    <article key={articleKey || article.id} className="overflow-hidden rounded-2xl border border-cyan-500/60 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 bg-[linear-gradient(135deg,#0ea5b7_0%,#0891b2_100%)] px-4 py-1 text-white">
        <div className="flex min-w-0 items-center gap-2">
          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f3c623] text-xs font-black lowercase text-brand-ink shadow-sm">
            doi
          </span>
          <span className="min-w-0 truncate rounded-md bg-white/20 px-2 py-0.5 text-xs font-semibold text-white md:text-sm">
            {article.doiNumber || "NA"}
          </span>
        </div>
        <p className="text-sm font-semibold italic">{article.articleType || "Article"}</p>
      </div>

      <div className="space-y-1.5 p-3">
        <div className="text-sm text-brand-slate">
          <span className="font-semibold text-brand-ink">Title:</span>{" "}
          <span className="text-sm font-medium text-brand-ink">{articleTitle}</span>
        </div>

        <div className="text-xs text-brand-slate">
          <span className="font-semibold text-brand-ink">Author:</span>{" "}
          <span>{resolveAuthorText(article)}</span>
        </div>

        <div className="text-xs text-brand-slate">
          <span className="font-semibold text-brand-ink">Publication Date:</span>{" "}
          <span>{formatPublishedDate(article.publishedDate)}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* ✅ Abstract button — opens in a NEW TAB */}
          <a
            href={abstractPath}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-[linear-gradient(135deg,#f8fdff_0%,#e6f7fb_100%)] px-2.5 py-1.5 text-brand-ink shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-md"
            aria-label={`Open abstract for ${articleTitle}`}
            title="Open abstract in new tab"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-white text-cyan-700 shadow-sm ring-1 ring-cyan-100 transition group-hover:bg-cyan-50">
              <ScrollText size={13} />
            </span>
            <span className="text-left">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-700">Abstract</span>
            </span>
          </a>

          {/* ✅ PDF button — opens the .pdf directly in a NEW TAB (native viewer) */}
          {pdfFileUrl ? (
            <a
              href={pdfFileUrl}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-[linear-gradient(135deg,#fff8f8_0%,#ffe9e9_100%)] px-2.5 py-1.5 text-brand-ink shadow-sm transition hover:-translate-y-0.5 hover:border-rose-400 hover:shadow-md"
              aria-label={`View PDF for ${articleTitle}`}
              title="Open PDF in new tab"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-white text-rose-600 shadow-sm ring-1 ring-rose-100 transition group-hover:bg-rose-50">
                <FileText size={13} />
              </span>
              <span className="text-left">
                <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-rose-600">PDF</span>
              </span>
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
// // import { FileText, ScrollText } from "lucide-react";
// // import { Link } from "react-router-dom";
// // import { buildPdfProxyUrl } from "../../utils/pdfProxy";
// // import { buildJournalArticleAbstractPath } from "../../utils/journalLinks";

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

// // export default function PublicArticleCard({ article, journalRoute, articleKey }) {
// //   const articleTitle = stripHtml(article.title) || "Untitled article";

// //   return (
// //     <article key={articleKey || article.id} className="overflow-hidden rounded-3xl border border-cyan-500/60 bg-white shadow-sm">
// //       <div className="flex items-center justify-between gap-4 bg-[linear-gradient(135deg,#0ea5b7_0%,#0891b2_100%)] px-5 py-1 text-white">
// //         <div className="flex min-w-0 items-center gap-2">
// //           <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f3c623] text-sm font-black lowercase text-brand-ink shadow-sm">
// //             doi
// //           </span>
// //           <span className="min-w-0 truncate rounded-md bg-white/20 px-3 py-1 text-sm font-semibold text-white md:text-base">
// //             {article.doiNumber || "NA"}
// //           </span>
// //         </div>
// //         <p className="text-lg font-semibold italic">{article.articleType || "Article"}</p>
// //       </div>

// //       <div className="space-y-5 p-5">
// //         <div className="text-sm text-brand-slate">
// //           <span className="font-semibold text-brand-ink">Title:</span>{" "}
// //           <span className="text-base font-medium text-brand-ink">{articleTitle}</span>
// //         </div>

// //         <div className="text-sm text-brand-slate">
// //           <span className="font-semibold text-brand-ink">Author:</span>{" "}
// //           <span>{resolveAuthorText(article)}</span>
// //         </div>

// //         <div className="text-sm text-brand-slate">
// //           <span className="font-semibold text-brand-ink">Publication Date:</span>{" "}
// //           <span>{formatPublishedDate(article.publishedDate)}</span>
// //         </div>

// //         <div className="flex flex-wrap items-center gap-3">
// //           <Link
// //             to={buildJournalArticleAbstractPath(journalRoute, article.id)}
// //             state={{ article }}
// //             className="group inline-flex items-center gap-3 rounded-2xl border border-sky-200 bg-[linear-gradient(135deg,#f8fdff_0%,#e6f7fb_100%)] px-4 py-3 text-brand-ink shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-md"
// //             aria-label={`Open abstract for ${articleTitle}`}
// //             title="Open abstract"
// //           >
// //             <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-cyan-700 shadow-sm ring-1 ring-cyan-100 transition group-hover:bg-cyan-50">
// //               <ScrollText size={18} />
// //             </span>
// //             <span className="text-left">
// //               <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-700">Abstract</span>
// //             </span>
// //           </Link>
// //           {article.pdfUrl ? (
// //             <a
// //               href={buildPdfProxyUrl(article.pdfUrl) || article.pdfUrl}
// //               className="group inline-flex items-center gap-3 rounded-2xl border border-rose-200 bg-[linear-gradient(135deg,#fff8f8_0%,#ffe9e9_100%)] px-4 py-3 text-brand-ink shadow-sm transition hover:-translate-y-0.5 hover:border-rose-400 hover:shadow-md"
// //               target="_blank"
// //               rel="noreferrer"
// //               aria-label={`Open PDF for ${articleTitle}`}
// //               title="Open PDF in new tab"
// //             >
// //               <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-rose-600 shadow-sm ring-1 ring-rose-100 transition group-hover:bg-rose-50">
// //                 <FileText size={18} />
// //               </span>
// //               <span className="text-left">
// //                 <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-600">PDF</span>
// //               </span>
// //             </a>
// //           ) : null}
// //         </div>
// //       </div>
// //     </article>
// //   );
// // }
// import { FileText, ScrollText } from "lucide-react";
// import { Link } from "react-router-dom";
// import { buildPdfProxyUrl } from "../../utils/pdfProxy";
// import { buildJournalArticleAbstractPath } from "../../utils/journalLinks";

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

// export default function PublicArticleCard({ article, journalRoute, articleKey }) {
//   const articleTitle = stripHtml(article.title) || "Untitled article";

//   return (
//     <article key={articleKey || article.id} className="overflow-hidden rounded-3xl border border-cyan-500/60 bg-white shadow-sm">
//       <div className="flex items-center justify-between gap-4 bg-[linear-gradient(135deg,#0ea5b7_0%,#0891b2_100%)] px-5 py-1 text-white">
//         <div className="flex min-w-0 items-center gap-2">
//           <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f3c623] text-sm font-black lowercase text-brand-ink shadow-sm">
//             doi
//           </span>
//           <span className="min-w-0 truncate rounded-md bg-white/20 px-3 py-1 text-sm font-semibold text-white md:text-base">
//             {article.doiNumber || "NA"}
//           </span>
//         </div>
//         <p className="text-lg font-semibold italic">{article.articleType || "Article"}</p>
//       </div>

//       <div className="space-y-5 p-5">
//         <div className="text-sm text-brand-slate">
//           <span className="font-semibold text-brand-ink">Title:</span>{" "}
//           <span className="text-base font-medium text-brand-ink">{articleTitle}</span>
//         </div>

//         <div className="text-sm text-brand-slate">
//           <span className="font-semibold text-brand-ink">Author:</span>{" "}
//           <span>{resolveAuthorText(article)}</span>
//         </div>

//         <div className="text-sm text-brand-slate">
//           <span className="font-semibold text-brand-ink">Publication Date:</span>{" "}
//           <span>{formatPublishedDate(article.publishedDate)}</span>
//         </div>

//         <div className="flex flex-wrap items-center gap-3">
//           <Link
//             to={buildJournalArticleAbstractPath(journalRoute, article.id)}
//             state={{ article }}
//             className="group inline-flex items-center gap-3 rounded-2xl border border-sky-200 bg-[linear-gradient(135deg,#f8fdff_0%,#e6f7fb_100%)] px-4 py-3 text-brand-ink shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-md"
//             aria-label={`Open abstract for ${articleTitle}`}
//             title="Open abstract"
//           >
//             <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-cyan-700 shadow-sm ring-1 ring-cyan-100 transition group-hover:bg-cyan-50">
//               <ScrollText size={18} />
//             </span>
//             <span className="text-left">
//               <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-700">Abstract</span>
//             </span>
//           </Link>

//           {article.pdfUrl ? (
//             <a
//               // ✅ Pass the article title as the filename so the browser saves it with a meaningful name
//               href={buildPdfProxyUrl(article.pdfUrl, { filename: articleTitle }) || article.pdfUrl}
//               className="group inline-flex items-center gap-3 rounded-2xl border border-rose-200 bg-[linear-gradient(135deg,#fff8f8_0%,#ffe9e9_100%)] px-4 py-3 text-brand-ink shadow-sm transition hover:-translate-y-0.5 hover:border-rose-400 hover:shadow-md"
//               target="_blank"
//               rel="noreferrer"
//               aria-label={`Open PDF for ${articleTitle}`}
//               title="Open PDF in new tab"
//             >
//               <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-rose-600 shadow-sm ring-1 ring-rose-100 transition group-hover:bg-rose-50">
//                 <FileText size={18} />
//               </span>
//               <span className="text-left">
//                 <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-600">PDF</span>
//               </span>
//             </a>
//           ) : null}
//         </div>
//       </div>
//     </article>
//   );
// }
