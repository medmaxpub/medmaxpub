import { useCallback, useEffect, useState } from "react";
import api, { shouldUseDevelopmentFallback, withFallback } from "../../api/client";
import DashboardMediaUploads from "../../components/admin/DashboardMediaUploads";
import { getSuperUserJournalsFallback } from "./superUserFallbacks";

export default function SuperUserMediaPage({ variant = "submission" }) {
  const [journals, setJournals] = useState([]);
  const useDevelopmentFallback = shouldUseDevelopmentFallback();

  const loadJournals = useCallback(async () => {
    const data = await withFallback(() => api.get("/admin/journals"), useDevelopmentFallback ? getSuperUserJournalsFallback() : []);
    setJournals(data || []);
  }, [useDevelopmentFallback]);

  useEffect(() => {
    loadJournals();
  }, [loadJournals]);

  const configByVariant = {
    submission: {
      showSubmission: true,
      showPpt: false,
      showVideo: false,
      headingLabel: "Online Submission",
      headingTitle: "Submission access",
      headingDescription: "Open the manuscript submission form from a dedicated admin-side page."
    },
    ppt: {
      showSubmission: false,
      showPpt: true,
      showVideo: false,
      headingLabel: "PPT Upload",
      headingTitle: "Upload journal PPT records",
      headingDescription: "Create PPT records with journal title, PPT title, author name, DOI, and the attached PPT file."
    },
    video: {
      showSubmission: false,
      showPpt: false,
      showVideo: true,
      headingLabel: "Video Upload",
      headingTitle: "Upload journal video records",
      headingDescription: "Create video records with journal title, video title, author name, DOI, and the attached video file."
    }
  };

  const config = configByVariant[variant] || configByVariant.submission;

  return <DashboardMediaUploads journals={journals} onUploaded={loadJournals} {...config} />;
}
