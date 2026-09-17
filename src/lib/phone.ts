/**
 * Telefónne číslo — kontrola, nie overenie. Port appkového `src/lib/phone.ts`.
 * Appka aj web overujú len že to VYZERÁ ako číslo (9+ číslic) — SMS
 * overenie appka nemá (platený poskytovateľ, mimo rozsahu).
 */
export const MIN_PHONE_DIGITS = 9;

export function phoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function isUsablePhone(value: string | null | undefined): boolean {
  return phoneDigits(value ?? "").length >= MIN_PHONE_DIGITS;
}
