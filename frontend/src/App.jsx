import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import RouteLoadingScreen from "./components/common/RouteLoadingScreen";
import ProtectedRoute from "./components/common/ProtectedRoute";
import JournalLayout from "./components/layout/JournalLayout";
import SuperUserLayout from "./components/super/SuperUserLayout";
import UserLayout from "./components/user/UserLayout";
import WebsiteLayout from "./components/layout/WebsiteLayout";

const JournalShell = lazy(() => import("./pages/journal/JournalShell"));
const JournalArticleAbstractPage = lazy(() => import("./pages/journal/JournalArticleAbstractPage"));
const JournalArchiveIssuePage = lazy(() => import("./pages/journal/JournalArchiveIssuePage"));
const AdminLoginPage = lazy(() => import("./pages/public/AdminLoginPage"));
const AboutPage = lazy(() => import("./pages/public/AboutPage"));
const ContactPage = lazy(() => import("./pages/public/ContactPage"));
const HomePage = lazy(() => import("./pages/public/HomePage"));
const JournalsPage = lazy(() => import("./pages/public/JournalsPage"));
const MembershipPage = lazy(() => import("./pages/public/MembershipPage"));
const PolicyPage = lazy(() => import("./pages/public/PolicyPage"));
const PptViewerPage = lazy(() => import("./pages/public/PptViewerPage"));
const PptsPage = lazy(() => import("./pages/public/PptsPage"));
const SubmitManuscriptPage = lazy(() => import("./pages/public/SubmitManuscriptPage"));
const VideosPage = lazy(() => import("./pages/public/VideosPage"));
const SuperUserDashboardPage = lazy(() => import("./pages/super/SuperUserDashboardPage"));
const SuperUserJournalsPage = lazy(() => import("./pages/super/SuperUserJournalsPage"));
const SuperUserMediaPage = lazy(() => import("./pages/super/SuperUserMediaPage"));
const SuperUserSettingsPage = lazy(() => import("./pages/super/SuperUserSettingsPage"));
const SuperUserSiteStatsPage = lazy(() => import("./pages/super/SuperUserSiteStatsPage"));
const SuperUserTestimonialsPage = lazy(() => import("./pages/super/SuperUserTestimonialsPage"));
const SuperUserUsersPage = lazy(() => import("./pages/super/SuperUserUsersPage"));
const UserArchivePagesPage = lazy(() => import("./pages/user/UserArchivePagesPage"));
const UserArchiveFormPage = lazy(() => import("./pages/user/UserArchiveFormPage"));
const UserArchiveIssuePage = lazy(() => import("./pages/user/UserArchiveIssuePage"));
const UserArticlesInPressFormPage = lazy(() => import("./pages/user/UserArticlesInPressFormPage"));
const UserArticlesInPressPage = lazy(() => import("./pages/user/UserArticlesInPressPage"));
const UserCurrentIssuePage = lazy(() => import("./pages/user/UserCurrentIssuePage"));
const UserCurrentIssueFormPage = lazy(() => import("./pages/user/UserCurrentIssueFormPage"));
const UserEditorialBoardFormPage = lazy(() => import("./pages/user/UserEditorialBoardFormPage"));
const UserEditorialBoardPage = lazy(() => import("./pages/user/UserEditorialBoardPage"));
const UserWelcomePage = lazy(() => import("./pages/user/UserWelcomePage"));

export default function App() {
  return (
    <Suspense fallback={<RouteLoadingScreen />}>
      <Routes>
        <Route element={<WebsiteLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/ppts" element={<PptsPage />} />
          <Route path="/ppts/:pptId/view" element={<PptViewerPage />} />
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
          <Route path="/journals/:journalUrl/archive/:year/:volume/:issueNumber" element={<JournalArchiveIssuePage />} />
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
            <Route path="dashboard" element={<UserWelcomePage />} />
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
          <Route path="/admin/site-stats" element={<Navigate to="/superuser/site-stats" replace />} />
          <Route path="/super" element={<Navigate to="/superuser/dashboard" replace />} />
          <Route path="/superuser" element={<SuperUserLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<SuperUserDashboardPage />} />
            <Route path="users" element={<SuperUserUsersPage />} />
            <Route path="journals" element={<SuperUserJournalsPage />} />
            <Route path="online-submission" element={<SuperUserMediaPage variant="submission" />} />
            <Route path="ppt-upload" element={<SuperUserMediaPage variant="ppt" />} />
            <Route path="video-upload" element={<SuperUserMediaPage variant="video" />} />
            <Route path="site-stats" element={<SuperUserSiteStatsPage />} />
            <Route path="testimonials" element={<SuperUserTestimonialsPage />} />
            <Route path="settings" element={<SuperUserSettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
