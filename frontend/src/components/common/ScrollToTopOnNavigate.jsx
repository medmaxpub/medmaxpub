import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTopOnNavigate() {
  const location = useLocation();

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 160);

    return () => window.clearTimeout(timerId);
  }, [location.pathname, location.search]);

  return null;
}
