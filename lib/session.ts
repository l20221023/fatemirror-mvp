import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "fm_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;

export async function getOrCreateSessionId() {
  let cookieStore: Awaited<ReturnType<typeof cookies>> | null = null;

  try {
    cookieStore = await cookies();
  } catch {
    return crypto.randomUUID();
  }

  const existingSession = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (existingSession) {
    return existingSession;
  }

  const sessionId = crypto.randomUUID();

  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return sessionId;
}
