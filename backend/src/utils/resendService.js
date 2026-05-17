import { Resend } from "resend";
import { AppError } from "./appError.js";

const FROM_EMAIL_PATTERN = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$|^.+\s<[^<>\s@]+@[^<>\s@]+\.[^<>\s@]+>$/;

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    throw new AppError("RESEND_API_KEY is not configured on the server.", 503);
  }

  return new Resend(apiKey);
}

function getAdminEmails() {
  return [...new Set(
    [process.env.ADMIN_EMAIL, process.env.CONTACT_TO_EMAIL]
      .map((value) => (typeof value === "string" ? value.trim() : ""))
      .filter(Boolean)
  )];
}

function getFromEmail() {
  return process.env.FROM_EMAIL?.trim() || process.env.CONTACT_FROM_EMAIL?.trim();
}

function validateEmailConfig() {
  const adminEmails = getAdminEmails();
  const fromEmail = getFromEmail();

  if (!adminEmails.length) {
    throw new AppError("ADMIN_EMAIL or CONTACT_TO_EMAIL must be configured on the server.", 503);
  }

  if (!fromEmail) {
    throw new AppError("FROM_EMAIL is not configured on the server.", 503);
  }

  if (!FROM_EMAIL_PATTERN.test(fromEmail)) {
    throw new AppError("FROM_EMAIL must use the format email@example.com or Name <email@example.com>.", 503);
  }

  return { adminEmails, fromEmail };
}

function buildAdminEmailHtml({ fullName, email, subject, message, submittedAt }) {
  const safeName = escapeHtml(fullName);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replaceAll("\n", "<br />");
  const safeSubmittedAt = escapeHtml(submittedAt);

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <h2 style="margin: 0 0 16px;">New Contact Query</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: 700;">Full Name</td>
          <td style="padding: 8px 0;">${safeName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 700;">User Email</td>
          <td style="padding: 8px 0;">${safeEmail}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 700;">Subject</td>
          <td style="padding: 8px 0;">${safeSubject}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 700; vertical-align: top;">Message</td>
          <td style="padding: 8px 0;">
            <div style="padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; background: #f9fafb;">
              ${safeMessage}
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 700;">Submitted At</td>
          <td style="padding: 8px 0;">${safeSubmittedAt}</td>
        </tr>
      </table>
    </div>
  `;
}

function buildAdminEmailText({ fullName, email, subject, message, submittedAt }) {
  return [
    "New Contact Query",
    `Full Name: ${fullName}`,
    `User Email: ${email}`,
    `Subject: ${subject}`,
    `Submitted At: ${submittedAt}`,
    "",
    "Message:",
    message
  ].join("\n");
}

function buildConfirmationEmailHtml({ fullName, subject }) {
  const safeName = escapeHtml(fullName);
  const safeSubject = escapeHtml(subject);

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <h2 style="margin: 0 0 16px;">Thank you for contacting Medmax Publishers</h2>
      <p style="margin: 0 0 12px;">Hello ${safeName},</p>
      <p style="margin: 0 0 12px;">
        We received your query regarding <strong>${safeSubject}</strong>.
      </p>
      <p style="margin: 0 0 12px;">
        Our team will review your message and get back to you as soon as possible.
      </p>
      <p style="margin: 0;">Regards,<br />Medmax Publishers</p>
    </div>
  `;
}

function buildConfirmationEmailText({ fullName, subject }) {
  return [
    `Hello ${fullName},`,
    "",
    "Thank you for contacting Medmax Publishers, we received your query.",
    `Subject: ${subject}`,
    "",
    "Our team will get back to you as soon as possible.",
    "",
    "Regards,",
    "Medmax Publishers"
  ].join("\n");
}

export async function sendContactEmails({ fullName, email, subject, message, submittedAt }) {
  const resend = getResendClient();
  const { adminEmails, fromEmail } = validateEmailConfig();

  let adminResult;

  try {
    adminResult = await resend.emails.send({
      from: fromEmail,
      to: adminEmails,
      replyTo: email,
      subject: `New Contact Query: ${subject}`,
      html: buildAdminEmailHtml({ fullName, email, subject, message, submittedAt }),
      text: buildAdminEmailText({ fullName, email, subject, message, submittedAt })
    });
  } catch (error) {
    throw new AppError(error?.message || "Failed to send contact email.", 502);
  }

  try {
    const confirmationResult = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: "Thank you for contacting Medmax Publishers",
      html: buildConfirmationEmailHtml({ fullName, subject }),
      text: buildConfirmationEmailText({ fullName, subject })
    });

    return {
      adminEmailId: adminResult?.data?.id || null,
      confirmationEmailId: confirmationResult?.data?.id || null
    };
  } catch (error) {
    throw new AppError(error?.message || "Failed to send confirmation email.", 502);
  }
}
