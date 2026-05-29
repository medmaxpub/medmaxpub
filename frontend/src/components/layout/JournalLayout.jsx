import StableOutlet from "../common/StableOutlet";
import ScrollToTopOnNavigate from "../common/ScrollToTopOnNavigate";
import Footer from "./Footer";
import FloatingContactActions from "./FloatingContactActions";
import JournalNavbar from "./JournalNavbar";

export default function JournalLayout() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-brand-mist">
      <ScrollToTopOnNavigate />
      <JournalNavbar />
      <main className="flex-1">
        <StableOutlet />
      </main>
      <FloatingContactActions />
      <Footer />
    </div>
  );
}
