import { AppError } from "../utils/appError.js";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;
const requestBuckets = new Map();

function getClientKey(req) {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }

  return req.ip || "unknown";
}

export function contactRateLimit(req, res, next) {
  const now = Date.now();
  const clientKey = getClientKey(req);
  const existingWindow = requestBuckets.get(clientKey) || [];
  const activeWindow = existingWindow.filter((timestamp) => now - timestamp < WINDOW_MS);

  if (activeWindow.length >= MAX_REQUESTS) {
    next(new AppError("Too many contact requests. Please wait a few minutes and try again.", 429));
    return;
  }

  activeWindow.push(now);
  requestBuckets.set(clientKey, activeWindow);
  next();
}
