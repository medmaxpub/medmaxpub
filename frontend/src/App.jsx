import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";
import SiteLayout from "./components/layout/SiteLayout";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import JournalShell from "./pages/journal/JournalShell";
import AdminLoginPage from "./pages/public/AdminLoginPage";
import AboutPage from "./pages/public/AboutPage";
import HomePage from "./pages/public/HomePage";
import JournalsPage from "./pages/public/JournalsPage";
import PptsPage from "./pages/public/PptsPage";
import VideosPage from "./pages/public/VideosPage";

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/journals" element={<JournalsPage />} />
        <Route path="/journals/:journalUrl" element={<Navigate to="about" replace />} />
        <Route path="/journals/:journalUrl/:section" element={<JournalShell />} />
        <Route path="/ppts" element={<PptsPage />} />
        <Route path="/videos" element={<VideosPage />} />
        <Route path="/about" element={<AboutPage />} />
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
