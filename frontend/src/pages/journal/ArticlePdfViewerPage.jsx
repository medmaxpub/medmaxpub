import { ArrowLeft, ChevronLeft, ChevronRight, Download, Loader2, ZoomIn, ZoomOut } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { cachedGet, shouldUseDevelopmentFallback, withFallback } from "../../api/client";
import EmptyState from "../../components/common/EmptyState";
import JournalMenu from "../../components/journal/JournalMenu";
import { mockJournals } from "../../data/mockData";
import { buildJournalArticleAbstractPath, getJournalRouteSlug } from "../../utils/journalLinks";
import { buildPdfProxyUrl } from "../../utils/pdfProxy";

// ✅ PDF.js renders the PDF on canvas — browser native viewer never shown
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

function stripHtml(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findArticleInJournal(journal, articleId) {
  const inPressMatch = (journal?.inPressArticles || []).find(
    (item) => String(item.id) === String(articleId)
  );
  if (inPressMatch) return inPressMatch;

  const currentIssueMatch = (journal?.currentIssue?.articles || []).find(
    (item) => String(item.id) === String(articleId)
  );
  if (currentIssueMatch) return currentIssueMatch;

  for (const year of journal?.archive || []) {
    for (const volume of year.volumes || []) {
      for (const issue of volume.issues || []) {
        const match = (issue.articles || []).find(
          (item) => String(item.id) === String(articleId)
        );
        if (match) return match;
      }
    }
  }
  return null;
}

// Renders a single PDF page on canvas
function PdfPageCanvas({ page, scale }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !page) return;
    const viewport = page.getViewport({ scale });
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    const renderTask = page.render({ canvasContext: ctx, viewport });
    return () => { renderTask.cancel?.(); };
  }, [page, scale]);

  return <canvas ref={canvasRef} className="mx-auto block w-full max-w-4xl rounded-lg shadow-md" />;
}

// Loads all pages of a PDF from a URL
function usePdfDocument(url) {
  const [pages, setPages] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setPages([]);

    pdfjsLib.getDocument({ url, withCredentials: false }).promise
      .then(async (pdfDoc) => {
        if (cancelled) return;
        setTotalPages(pdfDoc.numPages);
        const loaded = [];
        for (let i = 1; i <= pdfDoc.numPages; i++) {
          const p = await pdfDoc.getPage(i);
          if (cancelled) return;
          loaded.push(p);
        }
        setPages(loaded);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || "Failed to load PDF");
          setIsLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [url]);

  return { pages, totalPages, isLoading, error };
}

export default function ArticlePdfViewerPage() {
  const { journalUrl, articleId } = useParams();
  const location = useLocation();
  const [journal, setJournal] = useState(null);
  const [isJournalLoading, setIsJournalLoading] = useState(true);
  const [scale, setScale] = useState(1.4);
  const [currentPage, setCurrentPage] = useState(1);
  const pageRefs = useRef([]);
  const useDevelopmentFallback = shouldUseDevelopmentFallback();

  const loadJournal = useCallback(async () => {
    setIsJournalLoading(true);
    const data = await withFallback(
      () => cachedGet(`/journals/${journalUrl}`, {}, { ttlMs: 15000 }),
      useDevelopmentFallback
        ? mockJournals.find((item) => getJournalRouteSlug(item.publicJournalUrl || item.journalUrl) === journalUrl)
        : null
    );
    setJournal(data);
    setIsJournalLoading(false);
  }, [journalUrl, useDevelopmentFallback]);

  useEffect(() => { loadJournal(); }, [loadJournal]);

  const article = useMemo(() => {
    if (location.state?.article && String(location.state.article.id) === String(articleId)) {
      return location.state.article;
    }
    return findArticleInJournal(journal, articleId);
  }, [articleId, journal, location.state]);

  const articleTitle = stripHtml(article?.title) || "Article PDF";

  // ✅ Browser tab title = article name
  useEffect(() => {
    document.title = `${articleTitle} | Medmax Publishers`;
    return () => { document.title = "Medmax Publishers"; };
  }, [articleTitle]);

  // ✅ Proxy URL stays hidden — only used internally by PDF.js to fetch the file
  const pdfSrc = useMemo(() => {
    if (!article?.pdfUrl) return null;
    return buildPdfProxyUrl(article.pdfUrl, { filename: articleTitle });
  }, [article, articleTitle]);

  const downloadUrl = useMemo(() => {
    if (!article?.pdfUrl) return null;
    return buildPdfProxyUrl(article.pdfUrl, { filename: articleTitle, download: true });
  }, [article, articleTitle]);

  const { pages, totalPages, isLoading, error } = usePdfDocument(pdfSrc);
  const abstractPath = buildJournalArticleAbstractPath(journalUrl, articleId);

  function scrollToPage(pageNum) {
    const el = pageRefs.current[pageNum - 1];
    if (el) { el.scrollIntoView({ behavior: "smooth", block: "start" }); setCurrentPage(pageNum); }
  }

  if (isJournalLoading) return null;

  if (!article || !pdfSrc) {
    return (
      <div className="section-shell">
        <div className="container-shell">
          <EmptyState title="PDF not available" description="This article does not have a PDF attached yet." />
        </div>
      </div>
    );
  }

  return (
    <div className="section-shell">
      <div className="container-shell space-y-6">
        <div className="card-panel overflow-hidden">
          <div className="border-b border-brand-border px-5 py-5 sm:px-8 sm:py-6">
            <JournalMenu journalUrl={journal?.publicJournalUrl || journal?.journalUrl || journalUrl} />
          </div>

          <div className="p-5 sm:p-8">
            {/* Top action bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link to={abstractPath} state={location.state} className="button-secondary px-4 py-2">
                <ArrowLeft size={16} className="mr-2" />
                Back to Abstract
              </Link>
              {downloadUrl && (
                <a href={downloadUrl} className="button-primary px-4 py-2" download>
                  <Download size={16} className="mr-2" />
                  Download PDF
                </a>
              )}
            </div>

            {/* Article title — shown on our page, not in any PDF toolbar */}
            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.18em] text-brand-teal">{article.articleType || "Article"}</p>
              <h1 className="mt-2 font-display text-2xl font-semibold text-brand-ink sm:text-3xl">{articleTitle}</h1>
            </div>

            {/* Our own PDF controls — replaces browser PDF toolbar entirely */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-border bg-brand-surface px-5 py-3">
              <div className="flex items-center gap-2">
                <button onClick={() => scrollToPage(Math.max(currentPage - 1, 1))} disabled={currentPage <= 1 || isLoading}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-brand-border bg-white text-brand-slate hover:bg-brand-surface disabled:opacity-40">
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm text-brand-slate">
                  Page <span className="font-semibold text-brand-ink">{currentPage}</span>
                  {totalPages > 0 && <> of <span className="font-semibold text-brand-ink">{totalPages}</span></>}
                </span>
                <button onClick={() => scrollToPage(Math.min(currentPage + 1, totalPages))} disabled={currentPage >= totalPages || isLoading}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-brand-border bg-white text-brand-slate hover:bg-brand-surface disabled:opacity-40">
                  <ChevronRight size={16} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setScale((s) => Math.max(s - 0.2, 0.6))} disabled={scale <= 0.6}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-brand-border bg-white text-brand-slate hover:bg-brand-surface disabled:opacity-40">
                  <ZoomOut size={16} />
                </button>
                <span className="min-w-[3.5rem] text-center text-sm font-semibold text-brand-ink">{Math.round(scale * 100)}%</span>
                <button onClick={() => setScale((s) => Math.min(s + 0.2, 3))} disabled={scale >= 3}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-brand-border bg-white text-brand-slate hover:bg-brand-surface disabled:opacity-40">
                  <ZoomIn size={16} />
                </button>
              </div>
            </div>

            {/* ✅ PDF rendered on canvas — no browser PDF viewer, no toolbar, no "pdf-proxy" */}
            <div className="mt-4 overflow-auto rounded-2xl border border-brand-border bg-gray-100 p-4">
              {isLoading && (
                <div className="flex h-64 items-center justify-center gap-3 text-brand-slate">
                  <Loader2 size={24} className="animate-spin" />
                  <span>Loading PDF...</span>
                </div>
              )}
              {error && (
                <div className="flex h-64 items-center justify-center text-rose-600">
                  Failed to load PDF. Please try downloading it instead.
                </div>
              )}
              {!isLoading && !error && (
                <div className="space-y-6">
                  {pages.map((page, index) => (
                    <div key={index} ref={(el) => (pageRefs.current[index] = el)} onMouseEnter={() => setCurrentPage(index + 1)}>
                      <PdfPageCanvas page={page} scale={scale} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// import { ArrowLeft, Download } from "lucide-react";
// import { useCallback, useEffect, useMemo, useState } from "react";
// import { Link, useLocation, useParams } from "react-router-dom";
// import { cachedGet, shouldUseDevelopmentFallback, withFallback } from "../../api/client";
// import EmptyState from "../../components/common/EmptyState";
// import JournalMenu from "../../components/journal/JournalMenu";
// import { mockJournals } from "../../data/mockData";
// import { buildPdfProxyUrl } from "../../utils/pdfProxy";
// import { buildJournalArticleAbstractPath, getJournalRouteSlug } from "../../utils/journalLinks";

// function stripHtml(value) {
//   return String(value || "")
//     .replace(/<[^>]*>/g, " ")
//     .replace(/&nbsp;/gi, " ")
//     .replace(/\s+/g, " ")
//     .trim();
// }

// function findArticleInJournal(journal, articleId) {
//   const inPressMatch = (journal?.inPressArticles || []).find(
//     (item) => String(item.id) === String(articleId)
//   );
//   if (inPressMatch) return inPressMatch;

//   const currentIssueMatch = (journal?.currentIssue?.articles || []).find(
//     (item) => String(item.id) === String(articleId)
//   );
//   if (currentIssueMatch) return currentIssueMatch;

//   for (const year of journal?.archive || []) {
//     for (const volume of year.volumes || []) {
//       for (const issue of volume.issues || []) {
//         const archiveMatch = (issue.articles || []).find(
//           (item) => String(item.id) === String(articleId)
//         );
//         if (archiveMatch) return archiveMatch;
//       }
//     }
//   }

//   return null;
// }

// export default function ArticlePdfViewerPage() {
//   const { journalUrl, articleId } = useParams();
//   const location = useLocation();
//   const [journal, setJournal] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const useDevelopmentFallback = shouldUseDevelopmentFallback();

//   const loadJournal = useCallback(async () => {
//     setIsLoading(true);
//     const data = await withFallback(
//       () => cachedGet(`/journals/${journalUrl}`, {}, { ttlMs: 15000 }),
//       useDevelopmentFallback
//         ? mockJournals.find(
//             (item) => getJournalRouteSlug(item.publicJournalUrl || item.journalUrl) === journalUrl
//           )
//         : null
//     );
//     setJournal(data);
//     setIsLoading(false);
//   }, [journalUrl, useDevelopmentFallback]);

//   useEffect(() => {
//     loadJournal();
//   }, [loadJournal]);

//   const article = useMemo(() => {
//     // Use article passed via router state if available (avoids extra API call)
//     if (location.state?.article && String(location.state.article.id) === String(articleId)) {
//       return location.state.article;
//     }
//     return findArticleInJournal(journal, articleId);
//   }, [articleId, journal, location.state]);

//   const articleTitle = stripHtml(article?.title) || "Article PDF";

//   // ✅ Set the browser tab title to the article name
//   useEffect(() => {
//     if (articleTitle) {
//       document.title = `${articleTitle} | Medmax Publishers`;
//     }
//     return () => {
//       document.title = "Medmax Publishers";
//     };
//   }, [articleTitle]);

//   // ✅ The proxy URL is used ONLY inside the iframe — the user never sees it
//   const iframeSrc = useMemo(() => {
//     if (!article?.pdfUrl) return null;
//     return buildPdfProxyUrl(article.pdfUrl, { filename: articleTitle });
//   }, [article, articleTitle]);

//   // ✅ Download URL forces a Save dialog with the article title as filename
//   const downloadUrl = useMemo(() => {
//     if (!article?.pdfUrl) return null;
//     return buildPdfProxyUrl(article.pdfUrl, { filename: articleTitle, download: true });
//   }, [article, articleTitle]);

//   const abstractPath = buildJournalArticleAbstractPath(journalUrl, articleId);

//   if (isLoading) return null;

//   if (!article || !iframeSrc) {
//     return (
//       <div className="section-shell">
//         <div className="container-shell">
//           <EmptyState
//             title="PDF not available"
//             description="This article does not have a PDF attached yet."
//           />
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="section-shell">
//       <div className="container-shell space-y-6">
//         {/* Journal navigation menu */}
//         <div className="card-panel overflow-hidden">
//           <div className="border-b border-brand-border px-5 py-5 sm:px-8 sm:py-6">
//             <JournalMenu journalUrl={journal?.publicJournalUrl || journal?.journalUrl || journalUrl} />
//           </div>

//           <div className="p-5 sm:p-8">
//             {/* Top bar: back button + download */}
//             <div className="flex flex-wrap items-center justify-between gap-3">
//               <Link
//                 to={abstractPath}
//                 state={location.state}
//                 className="button-secondary px-4 py-2"
//               >
//                 <ArrowLeft size={16} className="mr-2" />
//                 Back to Abstract
//               </Link>

//               {downloadUrl && (
//                 <a
//                   href={downloadUrl}
//                   className="button-primary px-4 py-2"
//                   download
//                 >
//                   <Download size={16} className="mr-2" />
//                   Download PDF
//                 </a>
//               )}
//             </div>

//             {/* Article title */}
//             <div className="mt-6">
//               <p className="text-xs uppercase tracking-[0.18em] text-brand-teal">
//                 {article.articleType || "Article"}
//               </p>
//               <h1 className="mt-2 font-display text-2xl font-semibold text-brand-ink sm:text-3xl">
//                 {articleTitle}
//               </h1>
//             </div>

//             {/* ✅ PDF embedded in iframe — proxy URL is completely hidden from the address bar */}
//             <div className="mt-6 overflow-hidden rounded-2xl border border-brand-border shadow-sm">
//               <iframe
//                 src={iframeSrc}
//                 title={articleTitle}
//                 className="h-[80vh] w-full border-0"
//                 loading="eager"
//                 allow="fullscreen"
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
