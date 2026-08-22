import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabase } from '@/lib/supabase'
import { signSession, setSessionCookie } from '@/lib/session'
import {
  isValidPhone,
  isValidCountryCode,
  isValidPassword,
  err,
} from '@/lib/validation'
import type { AuthUser } from '@/types/auth'

export async function POST(req: NextRequest) {
  // ── 1. Parse ───────────────────────────────────────────────────────────────
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return err('Invalid JSON body', 400)
  }

  const { phone, countryCode, password } = body as Record<string, string>

  // ── 2. Validate inputs (fast, before hitting DB) ───────────────────────────
  if (!isValidCountryCode(countryCode))
    return err('كود الدولة غير مدعوم', 422, 'INVALID_COUNTRY_CODE')

  if (!isValidPhone(phone))
    return err('رقم الهاتف غير صالح', 422, 'INVALID_PHONE')

  if (!isValidPassword(password))
    return err('كلمة المرور قصيرة جداً', 422, 'INVALID_PASSWORD')

  const fullPhone = `${countryCode}${phone.trim()}`

  // ── 3. Look up user ────────────────────────────────────────────────────────
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('id, name, phone, country_code, full_phone, location, password_hash, role, created_at')
    .eq('full_phone', fullPhone)
    .maybeSingle()

  if (fetchError) {
    console.error('[login] Fetch error:', fetchError)
    return err('خطأ في الخادم، حاول مرة أخرى', 500, 'DB_ERROR')
  }

  // ── 4. Constant-time check (prevent user enumeration) ─────────────────────
  // Always run bcrypt even if user not found, using a dummy hash
  const DUMMY_HASH = '$2a$12$dummyhashtopreventtimingattacksXXXXXXXXXXXXXXXXXXXXXX'
  const hashToCheck = user?.password_hash ?? DUMMY_HASH
  const passwordMatch = await bcrypt.compare(password, hashToCheck)

  if (!user || !passwordMatch) {
    return err('رقم الهاتف أو كلمة المرور غير صحيحة', 401, 'INVALID_CREDENTIALS')
  }

  // ── 5. Set session ─────────────────────────────────────────────────────────
  const token = await signSession(user.id, user.role)
  await setSessionCookie(token)

  // ── 6. Return user ─────────────────────────────────────────────────────────
  const authUser: AuthUser = {
    id: user.id,
    name: user.name,
    phone: user.phone,
    countryCode: user.country_code,
    fullPhone: user.full_phone,
    location: user.location,
    role: user.role,
    createdAt: user.created_at,
  }

  return Response.json({ user: authUser }, { status: 200 })
}
