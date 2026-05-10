import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Authentication required", 401);
  }

  const token = authHeader.split(" ")[1];
  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || "local-dev-jwt-secret-medmaxpub-2026");
  } catch (error) {
    throw new AppError("Invalid or expired token", 401);
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    throw new AppError("User no longer exists", 401);
  }

  req.user = user;
  next();
});
