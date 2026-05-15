import { Download, ExternalLink, Printer } from "lucide-react";
import PdfJsViewerModal from "./PdfJsViewerModal";
import { buildPdfProxyUrl } from "../../utils/pdfProxy";

export default function PdfPreviewModal({ pdf, onClose }) {
  if (!pdf) {
    return null;
  }

  const inlinePdfUrl = pdf.fileUrl || buildPdfProxyUrl(pdf.fileUrl);
  const downloadPdfUrl = buildPdfProxyUrl(pdf.fileUrl, { download: true });

  return (
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
  );
}
