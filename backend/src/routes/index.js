import express from "express";
import { proxyFileAsset, proxyPdfAsset } from "../controllers/assetController.js";
import {
  confirmPasswordChange,
  impersonateUser,
  login,
  requestPasswordChangeOtp,
  signupAdmin
} from "../controllers/authController.js";
import {
  createArticle,
  deleteArticle,
  getArticleById,
  getArticlesByIssue,
  getUserArticles,
  updateArticle,
  updateArticleStatus
} from "../controllers/articleController.js";
import { createManuscriptSubmission, getAdminManuscriptSubmissions } from "../controllers/manuscriptSubmissionController.js";
import {
  createEditorialBoardMember,
  deleteEditorialBoardMember,
  getEditorialBoardMembers,
  updateEditorialBoardMember
} from "../controllers/editorialBoardController.js";
import {
  createJournal,
  deleteJournal,
  getAdminJournals,
  getJournalByUrl,
  getJournalIssues,
  getJournals,
  uploadJournalPdf,
  updateJournal
} from "../controllers/journalController.js";
import { createIssue } from "../controllers/issueController.js";
import { getAdminSiteStats, getSiteStats, updateAdminSiteStats } from "../controllers/siteStatsController.js";
import { deletePpt, getAdminPpts, getPptById, getPpts, regeneratePptPreview, updatePpt, uploadPpt } from "../controllers/pptController.js";
import { createVideo, getAdminVideos, getVideos } from "../controllers/videoController.js";
import { createTestimonial, deleteTestimonial, getTestimonials, updateTestimonial } from "../controllers/testimonialController.js";
import { createUser, deleteUser, getSuperUsers, getUsers, revealUserPassword, updateUser } from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";
import { pptUpload, upload } from "../middleware/upload.js";
import contactRoutes from "./contactRoutes.js";
import s3Routes from "./s3Routes.js";

const router = express.Router();

router.post("/auth/login", login);
router.post("/auth/signup-admin", protect, signupAdmin);
router.post("/auth/impersonate/:id", protect, impersonateUser);
router.post("/auth/settings/password-otp/request", protect, requestPasswordChangeOtp);
router.post("/auth/settings/password-otp/confirm", protect, confirmPasswordChange);
router.use("/contact", contactRoutes);
router.use("/s3", s3Routes);
router.post("/submissions", upload.array("files", 10), createManuscriptSubmission);
router.get("/assets/pdf-proxy", proxyPdfAsset);
router.get("/assets/file-proxy", proxyFileAsset);

router.get("/admin/journals", protect, getAdminJournals);
router.get("/admin/site-stats", protect, getAdminSiteStats);
router.put("/admin/site-stats", protect, updateAdminSiteStats);
router.get("/admin/submissions", protect, getAdminManuscriptSubmissions);
router.get("/admin/ppts", protect, getAdminPpts);
router.get("/admin/videos", protect, getAdminVideos);
router.get("/admin/users", protect, getUsers);
router.post("/admin/users", protect, createUser);
router.put("/admin/users/:id", protect, updateUser);
router.delete("/admin/users/:id", protect, deleteUser);
router.post("/admin/users/:id/reveal-password", protect, revealUserPassword);
router.get("/super/users", protect, getSuperUsers);
router.post("/super/users", protect, createUser);
router.put("/super/users/:id", protect, updateUser);
router.delete("/super/users/:id", protect, deleteUser);
router.post("/super/users/:id/reveal-password", protect, revealUserPassword);

router
  .route("/journals")
  .get(getJournals)
  .post(protect, upload.single("coverImage"), createJournal);

router.get("/site-stats", getSiteStats);

router
  .route("/journals/:id")
  .put(protect, upload.single("coverImage"), updateJournal)
  .delete(protect, deleteJournal);

router.get("/journals/:journalUrl", getJournalByUrl);
router.get("/journals/:id/issues", getJournalIssues);
router.post("/journals/:journalId/pdf", protect, upload.array("pdfFile"), uploadJournalPdf);

router.post("/issues", protect, createIssue);
router.post(
  "/articles",
  protect,
  upload.fields([
    { name: "pdfFile", maxCount: 1 },
    { name: "supplementaryFiles", maxCount: 6 }
  ]),
  createArticle
);
router.get("/issues/:id/articles", getArticlesByIssue);
router.get("/articles/:id", getArticleById);
router.get("/user/articles", protect, getUserArticles);
router.put(
  "/user/articles/:id",
  protect,
  upload.fields([
    { name: "pdfFile", maxCount: 1 },
    { name: "supplementaryFiles", maxCount: 6 }
  ]),
  updateArticle
);
router.patch("/user/articles/:id/status", protect, updateArticleStatus);
router.delete("/user/articles/:id", protect, deleteArticle);
router.get("/user/editorial-board", protect, getEditorialBoardMembers);
router.post("/user/editorial-board", protect, upload.single("profileImage"), createEditorialBoardMember);
router.put("/user/editorial-board/:id", protect, upload.single("profileImage"), updateEditorialBoardMember);
router.delete("/user/editorial-board/:id", protect, deleteEditorialBoardMember);

router.post(
  "/journals/:journalId/ppts",
  protect,
  pptUpload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "pptFile", maxCount: 1 },
    { name: "previewFile", maxCount: 1 }
  ]),
  uploadPpt
);
router.post(
  "/ppts/upload",
  protect,
  pptUpload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "pptFile", maxCount: 1 },
    { name: "previewFile", maxCount: 1 }
  ]),
  uploadPpt
);
router.get("/ppts", getPpts);
router.get("/ppts/:id", getPptById);
router.put(
  "/ppts/:id",
  protect,
  pptUpload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "pptFile", maxCount: 1 },
    { name: "previewFile", maxCount: 1 }
  ]),
  updatePpt
);
router.post("/ppts/:id/regenerate-preview", protect, regeneratePptPreview);
router.delete("/ppts/:id", protect, deletePpt);

router.post(
  "/journals/:journalId/videos",
  protect,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "videoFile", maxCount: 1 }
  ]),
  createVideo
);
router.post(
  "/videos",
  protect,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "videoFile", maxCount: 1 }
  ]),
  createVideo
);
router.get("/videos", getVideos);

router.post("/testimonials", protect, upload.single("image"), createTestimonial);
router.put("/testimonials/:id", protect, upload.single("image"), updateTestimonial);
router.delete("/testimonials/:id", protect, deleteTestimonial);
router.get("/testimonials", getTestimonials);

router.get("/health", (req, res) => {
  res.json({ message: "medmaxpub API is running" });
});

export default router;
