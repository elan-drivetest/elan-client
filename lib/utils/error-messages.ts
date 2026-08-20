// lib/utils/error-messages.ts
//
// Translates raw backend error payloads into user-friendly messages.
//
// The backend (NestJS legacy contract) returns errors shaped as:
//   { status_code: 422, message: "unprocessable entity", errors: { password: "incorrectPassword" } }
//   { status_code: 401, message: "http", errors: { unauthorised: ["unauthorised."] } }
//   { status_code: 404, message: "not found", errors: "notFound" }
//
// The `errors` values are machine codes (camelCase), not sentences — they must
// never be shown to users as-is. The code → copy map below was harvested from
// the backend source (server/**/*.service.ts on the feat/nextjs-backend
// branch, which mirrors the live NestJS API contract endpoint-for-endpoint).
import type { ApiError } from "@/lib/types/auth.types";

// Codes that mean the same thing regardless of which field they arrive under.
const CODE_MESSAGES: Record<string, string> = {
  // Login
  incorrectPassword: "Incorrect password. Please double-check and try again.",
  userIsNotActive:
    "Your account hasn't been activated yet. Please check your inbox for the verification email.",

  // Registration
  emailAlreadyExists:
    "An account with this email already exists. Try logging in instead.",
  phoneNumberAlreadyExists:
    "This phone number is already linked to another account.",

  // Forgot / reset password
  emailNotExists: "We couldn't find an account with that email address.",
  invalidHash:
    "This link is invalid or has expired. Please request a new one.",

  // Profile updates
  emailExists: "This email is already in use by another account.",
  missingOldPassword: "Please enter your current password.",
  incorrectOldPassword: "Your current password is incorrect. Please try again.",
  userNotFound:
    "We couldn't find your account. Please log out, log back in, and try again.",

  // File uploads
  selectFile: "Please choose a file to upload.",

  // Auth guard
  unauthorised: "Your session has expired. Please log in again.",
};

// Codes whose meaning depends on the field they arrive under
// (e.g. "notFound" under `email` on login vs under `hash` on a reset link).
const FIELD_CODE_MESSAGES: Record<string, string> = {
  "email:notFound": "We couldn't find an account with that email address.",
  "hash:notFound": "This link is no longer valid. Please request a new one.",
};

// Friendly labels for backend field names, used when we have to fall back to
// generating a message for a code we don't recognize.
const FIELD_LABELS: Record<string, string> = {
  email: "Email",
  password: "Password",
  oldPassword: "Current password",
  phone_number: "Phone number",
  full_name: "Full name",
  hash: "This link",
  file: "File",
  active: "Account",
  user: "Account",
  coupon: "Coupon code",
  coupon_code: "Coupon code",
};

// Raw backend `message` values that are HTTP boilerplate, never user copy.
const BOILERPLATE_MESSAGES = new Set([
  "http",
  "unauthorized",
  "unauthorised",
  "bad request",
  "not found",
  "unprocessable entity",
  "internal server error",
  "forbidden",
  "conflict",
]);

const STATUS_MESSAGES: Record<number, string> = {
  400: "That request couldn't be processed. Please check your details and try again.",
  401: "Your session has expired. Please log in again.",
  403: "You don't have permission to do that.",
  404: "We couldn't find what you were looking for.",
  409: "That conflicts with something that already exists. Please try again.",
  413: "That file is too large. Please choose a smaller one.",
  422: "Some of the information you entered needs attention. Please review and try again.",
  429: "Too many attempts. Please wait a moment and try again.",
  500: "Something went wrong on our end. Please try again in a few moments.",
  502: "We're having trouble reaching the server. Please try again in a few moments.",
  503: "The service is temporarily unavailable. Please try again in a few moments.",
};

const DEFAULT_MESSAGE = "Something went wrong. Please try again.";

/** "needLoginViaProvider:google" → social-login guidance. */
function providerMessage(code: string): string | undefined {
  if (!code.startsWith("needLoginViaProvider")) return undefined;
  const provider = code.split(":")[1]?.trim();
  if (!provider || provider === "email") {
    return "This account uses a different sign-in method. Please try another way to log in.";
  }
  const name = provider.charAt(0).toUpperCase() + provider.slice(1);
  return `This account was created with ${name}. Please sign in with ${name} instead.`;
}

/** "phoneNumberAlreadyExists" → "phone number already exists". */
function camelCaseToWords(code: string): string {
  return code
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .toLowerCase()
    .trim();
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function endSentence(text: string): string {
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

/**
 * Best-effort friendly message for an unknown code. Machine codes
 * ("couponExpired") become sentences ("Coupon expired."); messages that are
 * already sentences (Zod validation output like "phone_number must be a phone
 * number") get field names swapped for labels and are tidied up.
 */
function humanizeUnknown(field: string, code: string): string {
  const label = FIELD_LABELS[field] ?? capitalize(camelCaseToWords(field));

  if (!code.includes(" ")) {
    // Machine code, e.g. "couponExpired"
    const words = camelCaseToWords(code);
    // Avoid "Coupon code coupon expired." when the code already names the field
    const fieldWords = camelCaseToWords(field);
    if (words.startsWith(fieldWords)) {
      return endSentence(capitalize(words));
    }
    return endSentence(`${label}: ${words}`);
  }

  // Already a sentence — replace raw field tokens with the friendly label
  const sentence = code
    .replace(new RegExp(`\\b${field}\\b`, "gi"), label)
    .replace(/\s+/g, " ")
    .trim();
  return endSentence(capitalize(sentence));
}

/** Translate a single field/code pair to user-friendly copy. */
function translateFieldError(field: string, code: string): string {
  const trimmed = code.replace(/\.$/, "").trim();
  return (
    providerMessage(trimmed) ??
    FIELD_CODE_MESSAGES[`${field}:${trimmed}`] ??
    CODE_MESSAGES[trimmed] ??
    humanizeUnknown(field, trimmed)
  );
}

/** Normalize `errors` (string | Record<string, string | string[]>) into [field, code] pairs. */
function collectFieldErrors(errors: ApiError["errors"] | string): Array<[string, string]> {
  if (!errors) return [];
  if (typeof errors === "string") return [["_", errors]];

  const pairs: Array<[string, string]> = [];
  for (const [field, value] of Object.entries(errors)) {
    const codes = Array.isArray(value) ? value : [value];
    for (const code of codes) {
      if (typeof code === "string" && code.trim()) {
        pairs.push([field, code]);
      }
    }
  }
  return pairs;
}

/**
 * True when a login failed only because the account was never activated.
 *
 * The backend answers `{ status_code: 422, errors: { active: "userIsNotActive" } }`.
 * That is not a dead end — the account exists and the password was accepted —
 * so the UI offers to send the activation email again rather than leaving the
 * person staring at a login form they cannot get past.
 */
export function isInactiveAccountError(
  error?: Partial<ApiError> | null
): boolean {
  if (!error) return false;

  return collectFieldErrors(error.errors).some(
    ([, code]) => code.replace(/\.$/, "").trim() === "userIsNotActive"
  );
}

/**
 * Per-field friendly messages, for placing errors under the matching form
 * inputs. Keys are the backend field names (e.g. "email", "password").
 */
export function getFriendlyFieldErrors(
  error?: Partial<ApiError> | null
): Record<string, string> {
  const result: Record<string, string> = {};
  if (!error) return result;

  for (const [field, code] of collectFieldErrors(error.errors)) {
    if (field === "_" || field === "unauthorised") continue;
    if (!result[field]) {
      result[field] = translateFieldError(field, code);
    }
  }
  return result;
}

/**
 * The single most useful friendly message for an API error. Use this anywhere
 * an error is shown in a banner/alert rather than under a specific field.
 */
export function getFriendlyErrorMessage(
  error?: Partial<ApiError> | null,
  fallback: string = DEFAULT_MESSAGE
): string {
  if (!error) return fallback;

  // 1. Field-level codes are the most specific — translate the first one.
  const fieldErrors = collectFieldErrors(error.errors);
  for (const [field, code] of fieldErrors) {
    if (field === "_") {
      // Bare string error, e.g. errors: "notFound" on a 404
      const bare = code.replace(/\.$/, "").trim();
      const known = providerMessage(bare) ?? CODE_MESSAGES[bare];
      if (known) return known;
      if (bare === "notFound") {
        return STATUS_MESSAGES[404];
      }
      continue;
    }
    return translateFieldError(field, code);
  }

  // 2. A backend message that is real copy (not HTTP boilerplate).
  const rawMessage = error.message?.trim();
  if (rawMessage && !BOILERPLATE_MESSAGES.has(rawMessage.toLowerCase())) {
    // Network-layer messages from Axios aren't user copy either
    const isAxiosNoise = /network error|timeout|request failed/i.test(rawMessage);
    if (!isAxiosNoise) return endSentence(capitalize(rawMessage));
  }

  // 3. Status-code fallback.
  const status = error.status_code ?? 0;
  if (status && STATUS_MESSAGES[status]) {
    return STATUS_MESSAGES[status];
  }
  if (status >= 500) return STATUS_MESSAGES[500];
  if (!status) {
    return "We couldn't reach the server. Please check your internet connection and try again.";
  }

  return fallback;
}
