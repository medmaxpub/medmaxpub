import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTopOnNavigate() {
  const location = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);

  return null;
}
