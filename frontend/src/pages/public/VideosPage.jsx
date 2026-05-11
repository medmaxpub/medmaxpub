import { PlayCircle, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { shouldUseDevelopmentFallback, withFallback } from "../../api/client";
import EmptyState from "../../components/common/EmptyState";
import SectionHeader from "../../components/common/SectionHeader";
import { mockJournals, mockVideos } from "../../data/mockData";
import { buildJournalArchiveInfo, getAssetJournalUrl } from "../../utils/journalArchive";
import { hasEmbeddedVideo, normalizeVideoItem } from "../../utils/videoPlayer";

export default function VideosPage() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const useDevelopmentFallback = shouldUseDevelopmentFallback();

  useEffect(() => {
    let ignore = false;

    const loadItems = async () => {
      setIsLoading(true);
      const data = await withFallback(() => api.get("/videos"), useDevelopmentFallback ? mockVideos : []);
      const normalized = data.map(normalizeVideoItem);
      const journalLookup = {};

      if (useDevelopmentFallback) {
        mockJournals.forEach((journal) => {
          journalLookup[journal.journalUrl] = buildJournalArchiveInfo(journal);
        });
      } else {
        const journalUrls = [...new Set(normalized.map(getAssetJournalUrl).filter(Boolean))];
        const journalResults = await Promise.all(
          journalUrls.map(async (url) => {
            const journal = await withFallback(() => api.get(`/journals/${url}`), null);
            return journal ? [url, buildJournalArchiveInfo(journal)] : null;
          })
        );

        journalResults.filter(Boolean).forEach(([url, journal]) => {
          journalLookup[url] = journal;
        });
      }

      if (!ignore) {
        setItems(
          normalized.map((item) => ({
            ...item,
            journalInfo: journalLookup[getAssetJournalUrl(item)] || null
          }))
        );
        setIsLoading(false);
      }
    };

    loadItems();
    return () => {
      ignore = true;
    };
  }, [useDevelopmentFallback]);

  const filteredItems = items.filter((video) => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return true;
    }

    return [
      video.title,
      video.description,
      video.journalTitle,
      video.journalInfo?.title,
      video.journalInfo?.overview,
      video.journalInfo?.featuredArticleTitle,
      (video.journalInfo?.featuredAuthors || []).join(" ")
    ]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(normalizedQuery));
  });

  const journalCount = new Set(items.map((video) => video.journalInfo?.journalUrl || video.journalUrl).filter(Boolean)).size;
  const playableCount = items.filter(hasEmbeddedVideo).length;

  return (
    <div className="section-shell">
      <div className="container-shell">
        <SectionHeader
          label="Video Library"
          title="Journal-linked video records in one public archive"
          description="Browse embedded or uploaded videos with related journal information, current issue context, and direct links back to the journal."
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="card-panel p-5">
            <p className="text-sm uppercase tracking-[0.18em] text-brand-teal">Total Videos</p>
            <p className="mt-2 font-display text-4xl font-semibold text-brand-ink">{items.length}</p>
          </div>
          <div className="card-panel p-5">
            <p className="text-sm uppercase tracking-[0.18em] text-brand-teal">Playable Records</p>
            <p className="mt-2 font-display text-4xl font-semibold text-brand-ink">{playableCount}</p>
          </div>
          <div className="card-panel p-5">
            <p className="text-sm uppercase tracking-[0.18em] text-brand-teal">Linked Journals</p>
            <p className="mt-2 font-display text-4xl font-semibold text-brand-ink">{journalCount}</p>
          </div>
        </div>

        <div className="mt-8 card-panel p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <Search size={18} className="text-brand-slate" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search video titles, journal names, authors, or archive details"
              className="border-none bg-transparent p-0 shadow-none focus:ring-0"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="mt-10">
            <EmptyState title="Loading video archive" description="Public video records are being prepared." />
          </div>
        ) : filteredItems.length ? (
          <div className="mt-10 space-y-6">
            {filteredItems.map((video) => (
              <article key={video.id} className="card-panel overflow-hidden">
                <div className="grid xl:grid-cols-[1.05fr_0.95fr]">
                  <div className="bg-slate-950">
                    {video.youtubeUrl ? (
                      <iframe
                        title={video.title}
                        src={video.youtubeUrl}
                        className="aspect-video h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : video.videoUrl ? (
                      <video controls className="aspect-video h-full w-full" poster={video.thumbnailUrl || undefined}>
                        <source src={video.videoUrl} />
                      </video>
                    ) : video.thumbnailUrl ? (
                      <img src={video.thumbnailUrl} alt={video.title} className="aspect-video h-full w-full object-cover" />
                    ) : (
                      <div className="flex aspect-video items-center justify-center px-8 text-center text-sm text-slate-300">
                        Video playback is unavailable for this record right now.
                      </div>
                    )}
                  </div>

                  <div className="p-5 sm:p-7">
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="eyebrow mb-0">Video Record</span>
                      <p className="text-brand-slate">{video.journalInfo?.currentIssueLabel || "Journal media library"}</p>
                    </div>
                    <h2 className="mt-4 font-display text-3xl font-semibold text-brand-ink">{video.title}</h2>
                    <p className="mt-4 leading-7 text-brand-slate">{video.description || "Video description unavailable."}</p>

                    <div className="mt-6 rounded-3xl border border-brand-border bg-brand-elevated p-5">
                      <p className="text-xs uppercase tracking-[0.18em] text-brand-teal">Actions</p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        {video.youtubeUrl || video.videoUrl ? (
                          <a href={video.youtubeUrl || video.videoUrl} target="_blank" rel="noreferrer" className="button-primary px-4 py-2">
                            <PlayCircle size={16} className="mr-2" />
                            Open Video
                          </a>
                        ) : null}
                        {video.journalInfo?.journalUrl ? (
                          <Link to={`/journals/${video.journalInfo.journalUrl}/about`} className="button-secondary px-4 py-2">
                            Open Journal
                          </Link>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-6 rounded-3xl border border-brand-border bg-brand-surface p-5">
                      <p className="text-xs uppercase tracking-[0.18em] text-brand-teal">Related Journal</p>
                      <h3 className="mt-3 font-display text-2xl font-semibold text-brand-ink">
                        {video.journalInfo?.title || video.journalTitle || "Journal details unavailable"}
                      </h3>
                      {video.journalInfo?.domainName ? <p className="mt-2 text-sm text-brand-slate">{video.journalInfo.domainName}</p> : null}
                      {video.journalInfo?.editorName ? <p className="mt-1 text-sm text-brand-slate">Managed by {video.journalInfo.editorName}</p> : null}
                      {video.journalInfo?.overview ? (
                        <>
                          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-brand-teal">Abstract / Overview</p>
                          <p className="mt-2 text-sm leading-7 text-brand-slate">{video.journalInfo.overview}</p>
                        </>
                      ) : null}
                      {video.journalInfo?.featuredAuthors?.length ? (
                        <p className="mt-4 text-sm text-brand-slate">
                          <span className="font-semibold text-brand-ink">Authors:</span> {video.journalInfo.featuredAuthors.join(", ")}
                        </p>
                      ) : null}
                      {video.journalInfo?.featuredArticleTitle ? (
                        <p className="mt-2 text-sm text-brand-slate">
                          <span className="font-semibold text-brand-ink">Current article:</span> {video.journalInfo.featuredArticleTitle}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-10">
            <EmptyState
              title="No video records matched this search"
              description="Try a broader journal title, author name, or video keyword."
            />
          </div>
        )}
      </div>
    </div>
  );
}
