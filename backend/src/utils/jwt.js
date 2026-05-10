import jwt from "jsonwebtoken";

export function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET || "local-dev-jwt-secret-medmaxpub-2026", {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d"
  });
}
