import { randomBytes, createHash } from "node:crypto";

export function hashBetaInviteCode(code: string) {
  return createHash("sha256").update(code.trim()).digest("hex");
}

export function createBetaInviteCode(prefix = "fm") {
  const token = randomBytes(12).toString("base64url");
  return `${prefix}_${token}`.replace(/[^a-zA-Z0-9_-]/g, "");
}
