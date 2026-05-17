import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendContactEmails } from "../utils/resendService.js";

function normalizeValue(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const sendContactMessage = asyncHandler(async (req, res) => {
  const fullName = normalizeValue(req.body.fullName);
  const email = normalizeValue(req.body.email).toLowerCase();
  const subject = normalizeValue(req.body.subject);
  const message = normalizeValue(req.body.message);

  if (!fullName || !email || !subject || !message) {
    throw new AppError("Full Name, Email, Subject, and Message are required.", 400);
  }

  if (!isValidEmail(email)) {
    throw new AppError("Please provide a valid email address.", 400);
  }

  const submittedAt = new Date().toISOString();
  const emailResult = await sendContactEmails({
    fullName,
    email,
    subject,
    message,
    submittedAt
  });

  res.status(200).json({
    success: true,
    message: "Your message has been sent successfully.",
    data: {
      adminEmailId: emailResult.adminEmailId,
      confirmationEmailId: emailResult.confirmationEmailId
    }
  });
});
