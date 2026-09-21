import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scroll position manager for React Router SPA navigation.
 *
 * Behaviour:
 *  - Forward navigation (clicking a link)  → scroll to top
 *  - Back / Forward (browser buttons)      → restore saved scroll position
 *  - Cmd/Ctrl + click / middle click       → opens new tab, current page unchanged
 *
 * Works together with StableOutlet (140ms page transition) by waiting
 * 160ms before applying scroll — after the new page has mounted.
 *
 * Scroll positions are stored in a Map keyed by React Router's location.key,
 * which is unique per history entry. This means two visits to the same URL
 * get independent scroll positions, which is correct browser behaviour.
 */

// Persists for the lifetime of the tab — survives React re-renders
const scrollPositions = new Map();

export default function ScrollToTopOnNavigate() {
  const location = useLocation();
  const prevKeyRef = useRef(null);

  useEffect(() => {
    const currentKey = location.key;
    const prevKey = prevKeyRef.current;

    // Save the scroll position of the page we are LEAVING
    // before the new page mounts and steals the scroll.
    if (prevKey && prevKey !== currentKey) {
      scrollPositions.set(prevKey, window.scrollY);
    }

    // Decide what to do after the StableOutlet transition (160ms)
    const timerId = window.setTimeout(() => {
      if (scrollPositions.has(currentKey)) {
        // Back or Forward — restore the saved position
        window.scrollTo({ top: scrollPositions.get(currentKey), left: 0, behavior: "auto" });
      } else {
        // Fresh forward navigation — start at top
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      }
    }, 160);

    return () => window.clearTimeout(timerId);
  }, [location.key]); // ← key, not pathname — unique per history entry

  // Always keep prevKey in sync after every render
  useEffect(() => {
    prevKeyRef.current = location.key;
  });

  return null;
}