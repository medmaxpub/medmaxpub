import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ScrollToTopOnNavigate from "../common/ScrollToTopOnNavigate";
import StableOutlet from "../common/StableOutlet";
import { scrollWindowToTop } from "../../utils/scrollPosition";
import Footer from "./Footer";
import FloatingContactActions from "./FloatingContactActions";
import TopHeader from "./TopHeader";
import WebsiteNavbar from "./WebsiteNavbar";

export default function WebsiteLayout() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearch = (event) => {
    event.preventDefault();
    scrollWindowToTop();
    navigate(`/journals?search=${encodeURIComponent(searchTerm.trim())}`);
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-brand-mist">
      <ScrollToTopOnNavigate />
      <TopHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} onSearch={handleSearch} />
      <WebsiteNavbar />
      <main>
        <StableOutlet />
      </main>
      <FloatingContactActions />
      <Footer />
    </div>
  );
}
