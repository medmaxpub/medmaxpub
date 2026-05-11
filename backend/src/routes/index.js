import express from "express";
import { impersonateUser, login, signupAdmin } from "../controllers/authController.js";
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
import { createArticle, getArticleById, getArticlesByIssue } from "../controllers/articleController.js";
import { getAdminPpts, getPptById, getPpts, uploadPpt } from "../controllers/pptController.js";
import { createVideo, getAdminVideos, getVideos } from "../controllers/videoController.js";
import { createTestimonial, deleteTestimonial, getTestimonials, updateTestimonial } from "../controllers/testimonialController.js";
import { createUser, deleteUser, getUsers, revealUserPassword, updateUser } from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.post("/auth/login", login);
router.post("/auth/signup-admin", protect, signupAdmin);
router.post("/auth/impersonate/:id", protect, impersonateUser);

router.get("/admin/journals", protect, getAdminJournals);
router.get("/admin/ppts", protect, getAdminPpts);
router.get("/admin/videos", protect, getAdminVideos);
router.get("/admin/users", protect, getUsers);
router.post("/admin/users", protect, createUser);
router.put("/admin/users/:id", protect, updateUser);
router.delete("/admin/users/:id", protect, deleteUser);
router.post("/admin/users/:id/reveal-password", protect, revealUserPassword);

router
  .route("/journals")
  .get(getJournals)
  .post(protect, createJournal);

router
  .route("/journals/:id")
  .put(protect, updateJournal)
  .delete(protect, deleteJournal);

router.get("/journals/:journalUrl", getJournalByUrl);
router.get("/journals/:id/issues", getJournalIssues);
router.post("/journals/:journalId/pdf", protect, upload.single("pdfFile"), uploadJournalPdf);

router.post("/issues", protect, createIssue);
router.post("/articles", protect, upload.single("pdfFile"), createArticle);
router.get("/issues/:id/articles", getArticlesByIssue);
router.get("/articles/:id", getArticleById);

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
