import { useEffect, useRef } from "react";
import { DATA_REFRESH_EVENT, DATA_REFRESH_STORAGE_KEY } from "../utils/dataRefresh";

export default function useAutoRefresh(refresh, options = {}) {
  const { enabled = true, intervalMs = 20000, minGapMs = 1000 } = options;
  const refreshRef = useRef(refresh);

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      return undefined;
    }

    let lastRefreshAt = 0;

    const runRefresh = () => {
      const now = Date.now();

      if (now - lastRefreshAt < minGapMs) {
        return;
      }

      lastRefreshAt = now;
      Promise.resolve(refreshRef.current?.()).catch(() => {});
    };

    const handleFocus = () => runRefresh();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        runRefresh();
      }
    };
    const handleDataChange = () => runRefresh();
    const handleStorageChange = (event) => {
      if (event.key === DATA_REFRESH_STORAGE_KEY) {
        runRefresh();
      }
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener(DATA_REFRESH_EVENT, handleDataChange);
    window.addEventListener("storage", handleStorageChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const intervalId =
      intervalMs > 0
        ? window.setInterval(() => {
            if (document.visibilityState !== "hidden") {
              runRefresh();
            }
          }, intervalMs)
        : null;

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener(DATA_REFRESH_EVENT, handleDataChange);
      window.removeEventListener("storage", handleStorageChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [enabled, intervalMs, minGapMs]);
}
