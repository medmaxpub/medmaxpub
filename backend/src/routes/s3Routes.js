import express from "express";
import { deleteS3File, generateSignedUploadUrl } from "../controllers/s3Controller.js";

const router = express.Router();

router.post("/signed-url", generateSignedUploadUrl);
router.delete("/delete", deleteS3File);

export default router;
