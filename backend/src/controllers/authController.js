import Journal from "../models/Journal.js";
import User from "../models/User.js";
import { ensureSuperAdmin, normalizeRole } from "../utils/accessControl.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signToken } from "../utils/jwt.js";

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
