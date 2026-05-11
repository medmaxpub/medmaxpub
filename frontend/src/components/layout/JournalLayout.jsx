import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import JournalNavbar from "./JournalNavbar";

export default function JournalLayout() {
  return (
    <div className="min-h-screen bg-brand-mist">
      <JournalNavbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
