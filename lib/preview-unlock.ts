export function isPreviewUnlockAllowed() {
  return process.env.NODE_ENV !== "production";
}

export function readPreviewUnlockFlag(value: string | string[] | undefined) {
  return isPreviewUnlockAllowed() && value === "1";
}
