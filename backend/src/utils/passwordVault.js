import crypto from "crypto";

const DEFAULT_SECRET = "local-dev-medmaxpub-password-vault-secret-2026";

function getKey() {
  return crypto.createHash("sha256").update(process.env.PASSWORD_VAULT_SECRET || DEFAULT_SECRET).digest();
}

export function encryptPassword(plainText) {
  if (!plainText) {
    return "";
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(String(plainText), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return JSON.stringify({
    iv: iv.toString("hex"),
    tag: tag.toString("hex"),
    content: encrypted.toString("hex")
  });
}

export function decryptPassword(payload) {
  if (!payload) {
    return "";
  }

  const parsed = typeof payload === "string" ? JSON.parse(payload) : payload;
  const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), Buffer.from(parsed.iv, "hex"));
  decipher.setAuthTag(Buffer.from(parsed.tag, "hex"));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(parsed.content, "hex")), decipher.final()]);
  return decrypted.toString("utf8");
}
