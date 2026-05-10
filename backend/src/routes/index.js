import express from "express";
import { login, signupAdmin } from "../controllers/authController.js";
import {
  createJournal,
  createJournalWithOwner,
  deleteJournal,
  getAdminJournals,
  getJournalBySlug,
  getJournalIssues,
  getJournals,
  updateJournal
} from "../controllers/journalController.js";
import { createIssue } from "../controllers/issueController.js";
import { createArticle, getArticleById, getArticlesByIssue } from "../controllers/articleController.js";
import { getAdminPpts, getPptById, getPpts, uploadPpt } from "../controllers/pptController.js";
import { createVideo, getAdminVideos, getVideos } from "../controllers/videoController.js";
import { createTestimonial, getTestimonials } from "../controllers/testimonialController.js";
import { createContact, getContacts } from "../controllers/contactController.js";
import { getManuscripts, submitManuscript } from "../controllers/manuscriptController.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.post("/auth/login", login);
router.post("/auth/signup-admin", protect, signupAdmin);

router.get("/admin/journals", protect, getAdminJournals);
router.get("/admin/ppts", protect, getAdminPpts);
router.get("/admin/videos", protect, getAdminVideos);
router.post("/journals/onboard", upload.single("coverImage"), createJournalWithOwner);

router
  .route("/journals")
  .get(getJournals)
  .post(protect, upload.single("coverImage"), createJournal);

router
  .route("/journals/:id")
  .put(protect, upload.single("coverImage"), updateJournal)
  .delete(protect, deleteJournal);

router.get("/journals/:slug", getJournalBySlug);
router.get("/journals/:id/issues", getJournalIssues);

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

router.post("/testimonials", protect, createTestimonial);
router.get("/testimonials", getTestimonials);

router.post("/contact", createContact);
router.get("/admin/contact", protect, getContacts);

router.post("/manuscripts/submit", upload.single("manuscriptFile"), submitManuscript);
router.get("/admin/manuscripts", protect, getManuscripts);

router.get("/health", (req, res) => {
  res.json({ message: "medmaxpub API is running" });
});

export default router;
