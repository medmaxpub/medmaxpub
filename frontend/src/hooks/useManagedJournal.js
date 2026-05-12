import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../api/client";

const SELECTED_JOURNAL_STORAGE_KEY = "medmax-selected-journal";

function getJournalId(journal) {
  return journal?.id || journal?._id || "";
}

function getStoredSelectedJournalId() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(SELECTED_JOURNAL_STORAGE_KEY) || "";
}

export default function useManagedJournal() {
  const [journals, setJournals] = useState([]);
  const [selectedJournalId, setSelectedJournalId] = useState(getStoredSelectedJournalId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadJournal = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/admin/journals");
      const items = response.data || [];
      setJournals(items);
      setSelectedJournalId((current) => {
        if (current && items.some((item) => getJournalId(item) === current)) {
          return current;
        }

        return getJournalId(items[0]);
      });
    } catch (requestError) {
      setJournals([]);
      setSelectedJournalId("");
      setError(requestError.response?.data?.message || "Unable to load journal details.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJournal();
  }, [loadJournal]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (selectedJournalId) {
      window.localStorage.setItem(SELECTED_JOURNAL_STORAGE_KEY, selectedJournalId);
    } else {
      window.localStorage.removeItem(SELECTED_JOURNAL_STORAGE_KEY);
    }
  }, [selectedJournalId]);

  const journal = useMemo(() => {
    if (!journals.length) {
      return null;
    }

    return journals.find((item) => getJournalId(item) === selectedJournalId) || journals[0] || null;
  }, [journals, selectedJournalId]);

  return {
    journal,
    journals,
    selectedJournalId,
    setSelectedJournalId,
    loading,
    error,
    reloadJournal: loadJournal
  };
}
