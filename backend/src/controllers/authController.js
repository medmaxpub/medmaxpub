import Journal from "../models/Journal.js";
import User from "../models/User.js";
import { ensureElevatedAccess, ensureSuperAdmin, normalizeRole } from "../utils/accessControl.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signToken } from "../utils/jwt.js";
import { sendPasswordChangeOtpEmail } from "../utils/resendService.js";

async function buildOwnedJournalIds(userId) {
  const ownedJournals = await Journal.find({ owner: userId }).select("_id").lean();
  return ownedJournals.map((journal) => journal._id.toString());
}

async function authResponse(user, extra = {}) {
  const assignedJournalIds = await buildOwnedJournalIds(user._id);
  const normalizedRole = normalizeRole(user.role);

  return {
    token: signToken({ id: user._id }),
    user: {
      id: user._id,
      name: [user.firstName, user.lastName].filter(Boolean).join(" ").trim(),
      firstName: user.firstName,
      lastName: user.lastName,
      userName: user.userName,
      email: user.email || "",
      role: normalizedRole,
      assignedJournalIds,
      impersonator: extra.impersonator || null
    }
  };
}

export const signupAdmin = asyncHandler(async (req, res) => {
  ensureSuperAdmin(req.user);

  const { firstName, lastName, userName, email, password } = req.body;
  const normalizedUserName = String(userName || "").trim().toLowerCase();

  if (!firstName || !lastName || !normalizedUserName || !password) {
    throw new AppError("First name, last name, user name, and password are required", 400);
  }

  const existingUser = await User.findOne({
    $or: [{ userName: normalizedUserName }, ...(email ? [{ email }] : [])]
  });

  if (existingUser) {
    throw new AppError("Admin already exists with this user name or email", 400);
  }

  const user = await User.create({
    firstName,
    lastName,
    userName: normalizedUserName,
    email,
    password,
    role: "admin"
  });

  res.status(201).json(await authResponse(user));
});

export const login = asyncHandler(async (req, res) => {
  const identifier = String(req.body.identifier || req.body.userName || req.body.email || "")
    .trim()
    .toLowerCase();
  const { password } = req.body;

  if (!identifier || !password) {
    throw new AppError("User name and password are required", 400);
  }

  const user = await User.findOne({
    $or: [{ userName: identifier }, { email: identifier }]
  });

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid user name or password", 401);
  }

  res.json(await authResponse(user));
});

export const impersonateUser = asyncHandler(async (req, res) => {
  ensureSuperAdmin(req.user);

  const targetUser = await User.findById(req.params.id);

  if (!targetUser) {
    throw new AppError("User not found", 404);
  }

  if (normalizeRole(targetUser.role) !== "user") {
    throw new AppError("Only user accounts can be impersonated", 400);
  }

  res.json(
    await authResponse(targetUser, {
      impersonator: {
        id: req.user._id,
        userName: req.user.userName,
        name: [req.user.firstName, req.user.lastName].filter(Boolean).join(" ").trim(),
        role: normalizeRole(req.user.role)
      }
    })
  );
});

function normalizePassword(value) {
  return String(value || "");
}

function normalizeOtp(value) {
  return String(value || "")
    .replace(/\D/g, "")
    .slice(0, 6);
}

function buildOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function getPasswordChangeOtpRecipient(user) {
  const configuredRecipient =
    process.env.CONTACT_TO_EMAIL?.trim() || process.env.ADMIN_EMAIL?.trim() || "";

  if (configuredRecipient) {
    return configuredRecipient;
  }

  return String(user?.email || "").trim();
}

export const requestPasswordChangeOtp = asyncHandler(async (req, res) => {
  ensureElevatedAccess(req.user);

  const currentPassword = normalizePassword(req.body.currentPassword);
  const nextPassword = normalizePassword(req.body.newPassword);
  const otpRecipient = getPasswordChangeOtpRecipient(req.user);

  if (!currentPassword || !nextPassword) {
    throw new AppError("Current password and new password are required.", 400);
  }

  if (!(await req.user.comparePassword(currentPassword))) {
    throw new AppError("Current password is incorrect.", 400);
  }

  if (nextPassword.length < 8) {
    throw new AppError("New password must be at least 8 characters long.", 400);
  }

  if (!otpRecipient) {
    throw new AppError("Admin OTP email is missing. Please configure CONTACT_TO_EMAIL or ADMIN_EMAIL on the server.", 400);
  }

  const otp = buildOtpCode();
  req.user.setPasswordChangeOtp(otp);
  await req.user.save();

  await sendPasswordChangeOtpEmail({
    fullName: req.user.name || [req.user.firstName, req.user.lastName].filter(Boolean).join(" ").trim(),
    email: otpRecipient,
    otp
  });

  res.json({
    success: true,
    message: `OTP sent to ${otpRecipient}. It will expire in 10 minutes.`
  });
});

export const confirmPasswordChange = asyncHandler(async (req, res) => {
  ensureElevatedAccess(req.user);

  const currentPassword = normalizePassword(req.body.currentPassword);
  const nextPassword = normalizePassword(req.body.newPassword);
  const otp = normalizeOtp(req.body.otp);

  if (!currentPassword || !nextPassword || !otp) {
    throw new AppError("Current password, new password, and OTP are required.", 400);
  }

  if (!(await req.user.comparePassword(currentPassword))) {
    throw new AppError("Current password is incorrect.", 400);
  }

  if (nextPassword.length < 8) {
    throw new AppError("New password must be at least 8 characters long.", 400);
  }

  if (!req.user.matchesPasswordChangeOtp(otp)) {
    throw new AppError("Invalid or expired OTP.", 400);
  }

  req.user.password = nextPassword;
  req.user.clearPasswordChangeOtp();
  await req.user.save();

  res.json({
    success: true,
    message: "Password updated successfully."
  });
});
