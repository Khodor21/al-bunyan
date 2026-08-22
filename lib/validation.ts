// ── Phone ─────────────────────────────────────────────────────────────────────
// Accepts digits only, 7–12 characters (covers all Gulf/Arab formats)
export function isValidPhone(phone: string): boolean {
  return /^\d{7,12}$/.test(phone.trim())
}

// ── Country code ──────────────────────────────────────────────────────────────
const ALLOWED_CODES = new Set(['+966', '+965', '+971', '+962', '+961', '+20'])
export function isValidCountryCode(code: string): boolean {
  return ALLOWED_CODES.has(code)
}

// ── Password ──────────────────────────────────────────────────────────────────
// Min 8 chars — enforce more rules on the client for UX, keep server simple
export function isValidPassword(password: string): boolean {
  return typeof password === 'string' && password.length >= 8
}

// ── Name ─────────────────────────────────────────────────────────────────────
export function isValidName(name: string): boolean {
  return typeof name === 'string' && name.trim().length >= 2 && name.trim().length <= 120
}

// ── Location ─────────────────────────────────────────────────────────────────
const ALLOWED_LOCATIONS = new Set([
  'Saudia', 'Al-Sham', 'Egypt', 'Morocco', 'Al-Neel', 'Iraq',
])
export function isValidLocation(location: string): boolean {
  return ALLOWED_LOCATIONS.has(location)
}

// ── Generic error response helper ─────────────────────────────────────────────
export function err(message: string, status: number, code?: string) {
  return Response.json({ error: message, ...(code ? { code } : {}) }, { status })
}
