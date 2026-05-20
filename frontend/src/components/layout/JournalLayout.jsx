import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import FloatingContactActions from "./FloatingContactActions";
import JournalNavbar from "./JournalNavbar";

export default function JournalLayout() {
  return (
    <div className="min-h-screen overflow-x-clip bg-brand-mist">
      <JournalNavbar />
      <main>
        <Outlet />
      </main>
      <FloatingContactActions />
      <Footer />
    </div>
  );
}
