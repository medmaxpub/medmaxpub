import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

// Stores scroll positions keyed by route key (pathname + search)
const scrollStore = new Map();

export default function ScrollToTopOnNavigate() {
  const location = useLocation();
  const prevKeyRef = useRef(null);
  const routeKey = `${location.pathname}${location.search}`;

  useEffect(() => {
    // Save scroll position of the page we are LEAVING
    if (prevKeyRef.current && prevKeyRef.current !== routeKey) {
      scrollStore.set(prevKeyRef.current, window.scrollY);
    }

    const isBackOrForward = location.key !== "default" && scrollStore.has(routeKey);

    if (isBackOrForward) {
      // Restore saved scroll position for Back/Forward navigation
      const savedY = scrollStore.get(routeKey) ?? 0;
      const timerId = window.setTimeout(() => {
        window.scrollTo({ top: savedY, left: 0, behavior: "auto" });
      }, 160); // wait for StableOutlet transition to finish
      return () => window.clearTimeout(timerId);
    } else {
      // Normal forward navigation — scroll to top
      const timerId = window.setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      }, 160);
      return () => window.clearTimeout(timerId);
    }
  }, [routeKey, location.key]);

  // Track current key so we can save it when leaving
  useEffect(() => {
    prevKeyRef.current = routeKey;
  });

  return null;
}