export function normalizeVideoItem(video = {}) {
  return {
    ...video,
    id: video.id || video._id,
    title: video.title || "Untitled video",
    description: video.description || "",
    youtubeUrl: video.youtubeUrl || "",
    thumbnailUrl: video.thumbnailUrl || video.thumbnail?.secure_url || "",
    videoUrl: video.videoUrl || video.videoFile?.secure_url || "",
    journalTitle: video.journal?.title || video.journalTitle || "",
    journalSlug: video.journal?.slug || video.journalSlug || ""
  };
}

export function hasEmbeddedVideo(video) {
  return Boolean(video?.youtubeUrl || video?.videoUrl);
}
