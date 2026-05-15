import { useCallback, useEffect, useState } from "react";
import api, { shouldUseDevelopmentFallback, withFallback } from "../../api/client";
import DashboardMediaUploads from "../../components/admin/DashboardMediaUploads";
import SubmissionInbox from "../../components/admin/SubmissionInbox";
import { getSuperUserJournalsFallback } from "./superUserFallbacks";

export default function SuperUserMediaPage({ variant = "submission" }) {
  const [journals, setJournals] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const useDevelopmentFallback = shouldUseDevelopmentFallback();

  const loadJournals = useCallback(async () => {
    const data = await withFallback(() => api.get("/admin/journals"), useDevelopmentFallback ? getSuperUserJournalsFallback() : []);
    setJournals(data || []);
  }, [useDevelopmentFallback]);

  useEffect(() => {
    loadJournals();
  }, [loadJournals]);

  const loadSubmissions = useCallback(async () => {
    if (variant !== "submission") {
      return;
    }

    setIsLoadingSubmissions(true);
    const data = await withFallback(() => api.get("/admin/submissions"), []);
    setSubmissions(Array.isArray(data) ? data : []);
    setIsLoadingSubmissions(false);
  }, [variant]);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const configByVariant = {
    submission: {
      showSubmission: true,
      showPpt: false,
      showVideo: false,
      headingLabel: "Online Submission",
      headingTitle: "Submission inbox",
      headingDescription: "Review manuscript submissions received from the public online submission form."
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

  if (variant === "submission") {
    return (
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <SubmissionInbox submissions={submissions} isLoading={isLoadingSubmissions} />
      </div>
    );
  }

  return <DashboardMediaUploads journals={journals} onUploaded={loadJournals} {...config} />;
}
