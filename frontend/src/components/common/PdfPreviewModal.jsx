import { lazy, Suspense } from "react";
import { Download, ExternalLink, Printer } from "lucide-react";
import { buildPdfProxyUrl } from "../../utils/pdfProxy";

const PdfJsViewerModal = lazy(() => import("./PdfJsViewerModal"));

export default function PdfPreviewModal({ pdf, onClose }) {
  if (!pdf) {
    return null;
  }

  const inlinePdfUrl = buildPdfProxyUrl(pdf.fileUrl) || pdf.fileUrl;
  const downloadPdfUrl = buildPdfProxyUrl(pdf.fileUrl, { download: true });

  return (
    <Suspense fallback={null}>
      <PdfJsViewerModal
        label="Journal PDF"
        title={pdf.title}
        fileUrl={inlinePdfUrl}
        onClose={onClose}
        actions={[
          {
            label: "Print-Friendly Tab",
            href: inlinePdfUrl || pdf.fileUrl,
            variant: "soft",
            icon: Printer
          },
          {
            label: "Open in New Tab",
            href: inlinePdfUrl || pdf.fileUrl,
            variant: "secondary",
            icon: ExternalLink
          },
          {
            label: "Download PDF",
            href: downloadPdfUrl || pdf.fileUrl,
            variant: "primary",
            icon: Download
          }
        ]}
        emptyActions={[
          {
            label: "Download PDF",
            href: downloadPdfUrl || pdf.fileUrl,
            variant: "primary",
            icon: Download
          }
        ]}
      />
    </Suspense>
  );
}
