import { ConvexError } from "convex/values";

/** Best-effort raw message from any thrown value, before cleanup. */
function rawMessage(error: unknown): string {
  if (error instanceof ConvexError) {
    const data: unknown = error.data;
    if (typeof data === "string" && data.length > 0) {
      return data;
    }
    if (typeof data === "object" && data !== null && "message" in data) {
      const message = (data as { message?: unknown }).message;
      if (typeof message === "string" && message.length > 0) {
        return message;
      }
    }
  }
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }
  return "";
}

const NOISE =
  /^(\[CONVEX[^\]]*\]|\[Request ID[^\]]*\]|Server Error|Uncaught (ConvexError|Error):?|Called by client)$/i;

/**
 * Turn any thrown value into a short, human-readable message, stripping the
 * framework noise that Convex wraps around function errors.
 */
export function errorMessage(error: unknown, fallback: string): string {
  const raw = rawMessage(error);
  const cleaned = raw
    .split("\n")
    .map((line) =>
      line
        .replace(/\[CONVEX[^\]]*\]/g, "")
        .replace(/\[Request ID[^\]]*\]/g, "")
        .replace(/^Uncaught (ConvexError|Error):\s*/i, "")
        .replace(/^Called by client\s*/i, "")
        .trim()
    )
    .filter((line) => line.length > 0 && !NOISE.test(line))
    .join(" ")
    .trim();
  if (cleaned.length === 0) {
    return fallback;
  }
  return cleaned.length > 300 ? `${cleaned.slice(0, 297)}…` : cleaned;
}

/** Map credential errors from @convex-dev/auth to plain language. */
export function authErrorMessage(error: unknown): string {
  const raw = rawMessage(error);
  if (/invalidsecret|invalid\s?credentials|invalid account|invalidaccountid/i.test(raw)) {
    return "That email and password don’t match an account.";
  }
  if (/already exists/i.test(raw)) {
    return "An account with that email already exists — sign in instead.";
  }
  if (/invalid password/i.test(raw)) {
    return "Passwords must be at least 8 characters.";
  }
  if (/toomanyfailedattempts|too many|rate limit/i.test(raw)) {
    return "Too many failed attempts. Please wait a moment and try again.";
  }
  return errorMessage(error, "Something went wrong. Please try again.");
}
