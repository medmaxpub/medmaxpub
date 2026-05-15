import { Download, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../api/client";
import { buildAssetProxyUrl } from "../../utils/assetProxy";
import { buildPdfProxyUrl } from "../../utils/pdfProxy";
import { normalizePptItem } from "../../utils/pptPreview";
import PdfJsViewerModal from "./PdfJsViewerModal";

export default function PptPreviewModal({ ppt, onClose }) {
  const [resolvedPpt, setResolvedPpt] = useState(ppt ? normalizePptItem(ppt) : null);
  const [waitingForPreview, setWaitingForPreview] = useState(false);

  useEffect(() => {
    setResolvedPpt(ppt ? normalizePptItem(ppt) : null);
    setWaitingForPreview(false);
  }, [ppt]);

  useEffect(() => {
    if (!resolvedPpt?.id || resolvedPpt.previewPdfUrl || resolvedPpt.previewStatus === "failed") {
      setWaitingForPreview(false);
      return undefined;
    }

    let cancelled = false;
    let attempts = 0;
    setWaitingForPreview(true);

    const pollPreview = async () => {
      while (!cancelled && attempts < 6) {
        attempts += 1;

        try {
          const response = await api.get(`/ppts/${resolvedPpt.id}`);
          const nextPpt = normalizePptItem(response.data);

          if (cancelled) {
            return;
          }

          setResolvedPpt(nextPpt);

          if (nextPpt.previewPdfUrl || nextPpt.previewStatus === "failed") {
            setWaitingForPreview(false);
            return;
          }
        } catch {
          // Keep polling briefly while preview generation completes.
        }

        await new Promise((resolve) => window.setTimeout(resolve, 2000));
      }

      if (!cancelled) {
        setWaitingForPreview(false);
      }
    };

    pollPreview();

    return () => {
      cancelled = true;
    };
  }, [resolvedPpt?.id, resolvedPpt?.previewPdfUrl, resolvedPpt?.previewStatus]);

  if (!resolvedPpt) {
    return null;
  }

  const inlinePreviewUrl = buildPdfProxyUrl(resolvedPpt.previewPdfUrl) || resolvedPpt.previewPdfUrl;
  const originalPptDownloadUrl = buildAssetProxyUrl(resolvedPpt.originalPptUrl || resolvedPpt.pptFileUrl || resolvedPpt.pptUrl, {
    download: true
  });

  return (
    <PdfJsViewerModal
      label="PPT Preview"
      title={resolvedPpt.title}
      subtitle={resolvedPpt.journalTitle || ""}
      fileUrl={inlinePreviewUrl}
      onClose={onClose}
      basicViewer
      actions={[
        ...(resolvedPpt.previewPdfUrl
          ? [
              {
                label: "Open Preview PDF",
                href: inlinePreviewUrl || resolvedPpt.previewPdfUrl,
                variant: "soft",
                icon: ExternalLink
              }
            ]
          : []),
        ...(originalPptDownloadUrl
          ? [
              {
                label: "Download PPT",
                href: originalPptDownloadUrl,
                variant: "primary",
                icon: Download,
                download: true
              }
            ]
          : [])
      ]}
      emptyTitle={waitingForPreview ? "Preview is being generated" : "Preview unavailable"}
      emptyDescription={
        waitingForPreview
          ? "The PDF preview for this PPT is being generated automatically. Please try again shortly."
          : resolvedPpt.previewError || "Preview PDF generation failed for this PPT. You can still download the original presentation."
      }
      emptyActions={
        originalPptDownloadUrl
          ? [
              {
                label: "Download PPT",
                href: originalPptDownloadUrl,
                variant: "primary",
                icon: Download,
                download: true
              }
            ]
          : []
      }
    />
  );
}
