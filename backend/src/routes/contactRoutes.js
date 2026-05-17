import express from "express";
import { sendContactMessage } from "../controllers/contactController.js";
import { contactRateLimit } from "../middleware/contactRateLimit.js";

const router = express.Router();

router.post("/send", contactRateLimit, sendContactMessage);

export default router;
