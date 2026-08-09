// lib/utils/phone.utils.ts
// Canadian (NANP) phone number helpers.
//
// The business only operates in Canada, so every phone number is treated as
// a Canadian +1 number:
//   - Display format (inputs/UI):  (647) 679-4321
//   - API format (E.164):          +16476794321

/**
 * Strip a raw input down to the 10 national digits.
 * Tolerates any user format: "+1 647-679-4321", "1 (647) 679 4321",
 * "6476794321", etc. A leading country code "1" is dropped; extra digits
 * beyond 10 are ignored.
 */
export function nationalDigits(value: string | null | undefined): string {
  let digits = (value || "").replace(/\D/g, "");
  if (digits.startsWith("1")) {
    digits = digits.slice(1);
  }
  return digits.slice(0, 10);
}

/**
 * Format any raw input as a Canadian national number for display,
 * progressively while typing: "(647" → "(647) 679" → "(647) 679-4321".
 */
export function formatCanadianPhone(value: string | null | undefined): string {
  const digits = nationalDigits(value);
  if (!digits) return "";
  if (digits.length < 4) return `(${digits}`;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/**
 * Convert any raw input to E.164 for the API: "+16476794321".
 * Returns "" if the input doesn't contain a complete 10-digit number.
 */
export function toE164Canadian(value: string | null | undefined): string {
  const digits = nationalDigits(value);
  return digits.length === 10 ? `+1${digits}` : "";
}

/**
 * Format a stored phone number for read-only display: "+1 (647) 679-4321".
 * Falls back to the raw value when it isn't a complete 10-digit number
 * (e.g. legacy or international data), so nothing is ever hidden.
 */
export function formatCanadianPhoneDisplay(value: string | null | undefined): string {
  const digits = nationalDigits(value);
  if (digits.length !== 10) return (value || "").trim();
  return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/**
 * Valid Canadian/NANP number: 10 digits, area code and exchange
 * both starting with 2-9.
 */
export function isValidCanadianPhone(value: string | null | undefined): boolean {
  return /^[2-9]\d{2}[2-9]\d{6}$/.test(nationalDigits(value));
}
