import { useEffect, useState } from "react";
import { useLocation, useOutlet } from "react-router-dom";

export default function StableOutlet() {
  const outlet = useOutlet();
  const location = useLocation();
  const routeKey = `${location.pathname}${location.search}`;
  const [displayedOutlet, setDisplayedOutlet] = useState(outlet);
  const [displayedKey, setDisplayedKey] = useState(routeKey);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (routeKey === displayedKey) {
      return undefined;
    }

    setVisible(false);

    const swapTimer = window.setTimeout(() => {
      setDisplayedOutlet(outlet);
      setDisplayedKey(routeKey);
      window.requestAnimationFrame(() => setVisible(true));
    }, 140);

    return () => window.clearTimeout(swapTimer);
  }, [displayedKey, outlet, routeKey]);

  return (
    <div className={`page-transition min-h-full ${visible ? "page-transition-ready" : ""}`}>
      {displayedOutlet}
    </div>
  );
}
