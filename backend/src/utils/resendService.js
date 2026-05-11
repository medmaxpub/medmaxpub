import { AppError } from "./appError.js";

const RESEND_API_URL = "https://api.resend.com/emails";
const FROM_EMAIL_PATTERN = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$|^.+\s<[^<>\s@]+@[^<>\s@]+\.[^<>\s@]+>$/;

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function sendContactEmail({ fullName, email, subject, message, submittedAt }) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const toEmail = process.env.CONTACT_TO_EMAIL?.trim() || process.env.ADMIN_EMAIL?.trim();
  const fromEmail = process.env.CONTACT_FROM_EMAIL?.trim();

  if (!apiKey) {
    throw new AppError("RESEND_API_KEY is not configured on the server.", 503);
  }

  if (!toEmail) {
    throw new AppError("CONTACT_TO_EMAIL or ADMIN_EMAIL must be configured on the server.", 503);
  }

  if (!fromEmail) {
    throw new AppError("CONTACT_FROM_EMAIL must be configured on the server.", 503);
  }

  if (!FROM_EMAIL_PATTERN.test(fromEmail)) {
    throw new AppError(
      "CONTACT_FROM_EMAIL must use the format email@example.com or Name <email@example.com>.",
      503
    );
  }

  const safeName = escapeHtml(fullName);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replaceAll("\n", "<br />");
  const safeSubmittedAt = escapeHtml(submittedAt);

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      subject: `New Contact Form Message: ${subject}`,
      reply_to: email,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
          <h2 style="margin-bottom: 16px;">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Subject:</strong> ${safeSubject}</p>
          <p><strong>Submitted:</strong> ${safeSubmittedAt}</p>
          <div style="margin-top: 16px;">
            <strong>Message:</strong>
            <div style="margin-top: 8px; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; background: #f9fafb;">
              ${safeMessage}
            </div>
          </div>
        </div>
      `,
      text: [
        "New Contact Form Submission",
        `Name: ${fullName}`,
        `Email: ${email}`,
        `Subject: ${subject}`,
        `Submitted: ${submittedAt}`,
        "",
        "Message:",
        message
      ].join("\n")
    })
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const resendMessage = payload?.message || payload?.error?.message || "Resend email delivery failed.";
    throw new AppError(resendMessage, 502);
  }

  return payload;
}
