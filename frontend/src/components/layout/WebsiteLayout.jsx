import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Footer from "./Footer";
import FloatingContactActions from "./FloatingContactActions";
import TopHeader from "./TopHeader";
import WebsiteNavbar from "./WebsiteNavbar";

export default function WebsiteLayout() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearch = (event) => {
    event.preventDefault();
    navigate(`/journals?search=${encodeURIComponent(searchTerm.trim())}`);
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-brand-mist">
      <TopHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} onSearch={handleSearch} />
      <WebsiteNavbar />
      <main>
        <Outlet />
      </main>
      <FloatingContactActions />
      <Footer />
    </div>
  );
}
