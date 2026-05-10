import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";
import TopHeader from "./TopHeader";

export default function SiteLayout() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearch = (event) => {
    event.preventDefault();
    navigate(`/journals?search=${encodeURIComponent(searchTerm.trim())}`);
  };

  return (
    <div className="min-h-screen bg-brand-mist">
      <TopHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} onSearch={handleSearch} />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

