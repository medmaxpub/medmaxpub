export function canUseRemotePreview(url) {
  return Boolean(url && !/^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)/i.test(url));
}

export function buildOfficePreviewUrl(url) {
  if (!canUseRemotePreview(url)) {
    return null;
  }

  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
}

export function buildModalPreviewUrl(item) {
  if (item.previewFile?.secure_url) {
    return `${item.previewFile.secure_url}#toolbar=1&navpanes=0&view=FitH`;
  }

  if (item.previewUrl && !/docs\.google\.com/i.test(item.previewUrl)) {
    return item.previewUrl;
  }

  const fileUrl = item.fileUrl || item.file?.secure_url;
  return buildOfficePreviewUrl(fileUrl);
}

export function normalizePptItem(item) {
  const fileUrl = item.fileUrl || item.file?.secure_url;
  const previewUrl = item.previewUrl || item.previewFile?.secure_url || buildOfficePreviewUrl(fileUrl);

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
