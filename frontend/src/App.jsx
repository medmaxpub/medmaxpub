import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/common/ProtectedRoute";
import JournalLayout from "./components/layout/JournalLayout";
import SuperUserLayout from "./components/super/SuperUserLayout";
import UserLayout from "./components/user/UserLayout";
import WebsiteLayout from "./components/layout/WebsiteLayout";
import JournalShell from "./pages/journal/JournalShell";
import JournalArticleAbstractPage from "./pages/journal/JournalArticleAbstractPage";
import AdminLoginPage from "./pages/public/AdminLoginPage";
import AboutPage from "./pages/public/AboutPage";
import ContactPage from "./pages/public/ContactPage";
import HomePage from "./pages/public/HomePage";
import JournalsPage from "./pages/public/JournalsPage";
import MembershipPage from "./pages/public/MembershipPage";
import PolicyPage from "./pages/public/PolicyPage";
import PptsPage from "./pages/public/PptsPage";
import SuperUserDashboardPage from "./pages/super/SuperUserDashboardPage";
import SuperUserJournalsPage from "./pages/super/SuperUserJournalsPage";
import SuperUserMediaPage from "./pages/super/SuperUserMediaPage";
import SuperUserTestimonialsPage from "./pages/super/SuperUserTestimonialsPage";
import SuperUserUsersPage from "./pages/super/SuperUserUsersPage";
import UserArchivePagesPage from "./pages/user/UserArchivePagesPage";
import UserArchiveFormPage from "./pages/user/UserArchiveFormPage";
import UserArchiveIssuePage from "./pages/user/UserArchiveIssuePage";
import UserArticlesInPressFormPage from "./pages/user/UserArticlesInPressFormPage";
import UserArticlesInPressPage from "./pages/user/UserArticlesInPressPage";
import UserCurrentIssuePage from "./pages/user/UserCurrentIssuePage";
import UserCurrentIssueFormPage from "./pages/user/UserCurrentIssueFormPage";
import UserEditorialBoardFormPage from "./pages/user/UserEditorialBoardFormPage";
import UserEditorialBoardPage from "./pages/user/UserEditorialBoardPage";
import UserWelcomePage from "./pages/user/UserWelcomePage";
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
        <Route path="/terms-and-conditions" element={<PolicyPage policyKey="terms" />} />
        <Route path="/withdraw-policy" element={<PolicyPage policyKey="withdraw" />} />
        <Route path="/privacy-policy" element={<PolicyPage policyKey="privacy" />} />
      </Route>

      <Route element={<JournalLayout />}>
        <Route path="/journals" element={<JournalsPage />} />
        <Route path="/journals/:journalUrl" element={<Navigate to="home" replace />} />
        <Route path="/journals/:journalUrl/article-in-press/:articleId/abstract" element={<JournalArticleAbstractPage />} />
        <Route path="/journals/:journalUrl/:section" element={<JournalShell />} />
      </Route>

      <Route path="/login" element={<AdminLoginPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/user/login" element={<AdminLoginPage />} />
      <Route path="/super/login" element={<AdminLoginPage />} />
      <Route path="/superuser/login" element={<AdminLoginPage />} />

      <Route element={<ProtectedRoute allowedRoles={["user"]} redirectTo="/login" />}>
        <Route path="/user" element={<UserLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Navigate to="/user/articles-in-press" replace />} />
          <Route path="welcome" element={<UserWelcomePage />} />
          <Route path="editorial-board" element={<UserEditorialBoardPage />} />
          <Route path="editorial-board/add" element={<UserEditorialBoardFormPage />} />
          <Route path="editorial-board/:memberId/edit" element={<UserEditorialBoardFormPage />} />
          <Route path="articles-in-press" element={<UserArticlesInPressPage />} />
          <Route path="articles-in-press/add" element={<UserArticlesInPressFormPage />} />
          <Route path="articles-in-press/:articleId/edit" element={<UserArticlesInPressFormPage />} />
          <Route path="current-issue" element={<UserCurrentIssuePage />} />
          <Route path="current-issue/add" element={<UserCurrentIssueFormPage />} />
          <Route path="current-issue/:articleId/edit" element={<UserCurrentIssueFormPage />} />
          <Route path="archive-pages" element={<UserArchivePagesPage />} />
          <Route path="archive-pages/add" element={<UserArchiveFormPage />} />
          <Route path="archive-pages/article/:articleId/edit" element={<UserArchiveFormPage />} />
          <Route path="archive-pages/issue/:year/:volume/:issueNumber" element={<UserArchiveIssuePage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["super_user", "admin"]} redirectTo="/login" />}>
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<Navigate to="/superuser/dashboard" replace />} />
        <Route path="/admin/online-submission" element={<Navigate to="/superuser/online-submission" replace />} />
        <Route path="/admin/ppt-upload" element={<Navigate to="/superuser/ppt-upload" replace />} />
        <Route path="/admin/video-upload" element={<Navigate to="/superuser/video-upload" replace />} />
        <Route path="/super" element={<Navigate to="/superuser/dashboard" replace />} />
        <Route path="/superuser" element={<SuperUserLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SuperUserDashboardPage />} />
          <Route path="users" element={<SuperUserUsersPage />} />
          <Route path="journals" element={<SuperUserJournalsPage />} />
          <Route path="online-submission" element={<SuperUserMediaPage variant="submission" />} />
          <Route path="ppt-upload" element={<SuperUserMediaPage variant="ppt" />} />
          <Route path="video-upload" element={<SuperUserMediaPage variant="video" />} />
          <Route path="testimonials" element={<SuperUserTestimonialsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
