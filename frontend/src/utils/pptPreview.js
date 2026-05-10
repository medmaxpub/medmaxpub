export function canUseGooglePreview(url) {
  return Boolean(url && !/^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)/i.test(url));
}

export function buildModalPreviewUrl(item) {
  if (item.previewFile?.secure_url) {
    return `${item.previewFile.secure_url}#toolbar=1&navpanes=0&view=FitH`;
  }

  if (item.previewUrl) {
    return item.previewUrl;
  }

  const fileUrl = item.fileUrl || item.file?.secure_url;

  if (canUseGooglePreview(fileUrl)) {
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
  }

  return null;
}

export function normalizePptItem(item) {
  const fileUrl = item.fileUrl || item.file?.secure_url;
  const previewUrl =
    item.previewUrl ||
    item.previewFile?.secure_url ||
    (canUseGooglePreview(fileUrl) ? `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(fileUrl)}` : null);

  return {
    ...item,
    id: item.id || item._id,
    uploadedDate: item.uploadedDate || item.createdAt,
    fileUrl,
    previewUrl,
    viewUrl: previewUrl || fileUrl,
    modalPreviewUrl: buildModalPreviewUrl({ ...item, fileUrl, previewUrl }),
    journalTitle: item.journalTitle || item.journal?.title || ""
  };
}
