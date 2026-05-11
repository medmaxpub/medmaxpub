import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";
import JournalLayout from "./components/layout/JournalLayout";
import WebsiteLayout from "./components/layout/WebsiteLayout";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import JournalShell from "./pages/journal/JournalShell";
import AdminLoginPage from "./pages/public/AdminLoginPage";
import AboutPage from "./pages/public/AboutPage";
import ContactPage from "./pages/public/ContactPage";
import HomePage from "./pages/public/HomePage";
import JournalsPage from "./pages/public/JournalsPage";
import MembershipPage from "./pages/public/MembershipPage";
import PptsPage from "./pages/public/PptsPage";
import SubmitManuscriptPage from "./pages/public/SubmitManuscriptPage";
import VideosPage from "./pages/public/VideosPage";

export default function App() {
  return (
    <Routes>
      <Route element={<WebsiteLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/ppts" element={<PptsPage />} />
        <Route path="/videos" element={<VideosPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/submit-manuscript" element={<SubmitManuscriptPage />} />
        <Route path="/membership" element={<MembershipPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      <Route element={<JournalLayout />}>
        <Route path="/journals" element={<JournalsPage />} />
        <Route path="/journals/:journalUrl" element={<Navigate to="about" replace />} />
        <Route path="/journals/:journalUrl/:section" element={<JournalShell />} />
      </Route>

      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
