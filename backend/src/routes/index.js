import express from "express";
import { proxyPdfAsset } from "../controllers/assetController.js";
import { impersonateUser, login, signupAdmin } from "../controllers/authController.js";
import {
  createArticle,
  deleteArticle,
  getArticleById,
  getArticlesByIssue,
  getUserArticles,
  updateArticle,
  updateArticleStatus
} from "../controllers/articleController.js";
import { postContactMessage } from "../controllers/contactController.js";
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
import { getAdminPpts, getPptById, getPpts, uploadPpt } from "../controllers/pptController.js";
import { createVideo, getAdminVideos, getVideos } from "../controllers/videoController.js";
import { createTestimonial, deleteTestimonial, getTestimonials, updateTestimonial } from "../controllers/testimonialController.js";
import { createUser, deleteUser, getSuperUsers, getUsers, revealUserPassword, updateUser } from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.post("/auth/login", login);
router.post("/auth/signup-admin", protect, signupAdmin);
router.post("/auth/impersonate/:id", protect, impersonateUser);
router.post("/contact", ...postContactMessage);
router.get("/assets/pdf-proxy", proxyPdfAsset);

router.get("/admin/journals", protect, getAdminJournals);
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
  upload.fields([
    { name: "pptFile", maxCount: 1 },
    { name: "previewFile", maxCount: 1 }
  ]),
  uploadPpt
);
router.post(
  "/ppts/upload",
  protect,
  upload.fields([
    { name: "pptFile", maxCount: 1 },
    { name: "previewFile", maxCount: 1 }
  ]),
  uploadPpt
);
router.get("/ppts", getPpts);
router.get("/ppts/:id", getPptById);

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
