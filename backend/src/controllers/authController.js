import Journal from "../models/Journal.js";
import User from "../models/User.js";
import { ensureSuperAdmin, normalizeRole } from "../utils/accessControl.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signToken } from "../utils/jwt.js";

function authResponse(user) {
  return {
    token: signToken({ id: user._id }),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: normalizeRole(user.role),
      assignedJournalIds: (user.assignedJournals || []).map((journal) => journal.toString())
    }
  };
}

export const signupAdmin = asyncHandler(async (req, res) => {
  ensureSuperAdmin(req.user);

  const { name, email, password, role, journalIds = [] } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError("Admin already exists with this email", 400);
  }

  const normalizedRole = role === "journal_admin" ? "journal_admin" : "super_admin";
  const assignedJournals = normalizedRole === "journal_admin" ? journalIds : [];

  if (normalizedRole === "journal_admin" && !assignedJournals.length) {
    throw new AppError("Journal admins must be assigned to at least one journal", 400);
  }

  if (assignedJournals.length) {
    const journalCount = await Journal.countDocuments({ _id: { $in: assignedJournals } });

    if (journalCount !== assignedJournals.length) {
      throw new AppError("One or more assigned journals are invalid", 400);
    }
  }

  const user = await User.create({
    name,
    email,
    password,
    role: normalizedRole,
    assignedJournals
  });
  res.status(201).json(authResponse(user));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid email or password", 401);
  }

  res.json(authResponse(user));
});
