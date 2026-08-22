import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'
import { err } from '@/lib/validation'
import type { AuthUser } from '@/types/auth'

export async function GET() {
  // ── 1. Verify session cookie ───────────────────────────────────────────────
  const session = await getSession()
  if (!session) {
    return err('غير مخوّل — يرجى تسجيل الدخول', 401, 'UNAUTHENTICATED')
  }

  // ── 2. Fetch fresh user data ───────────────────────────────────────────────
  const { data: user, error } = await supabase
    .from('users')
    .select('id, name, phone, country_code, full_phone, location, role, created_at')
    .eq('id', session.sub)
    .maybeSingle()

  if (error) {
    console.error('[me] Fetch error:', error)
    return err('خطأ في الخادم', 500, 'DB_ERROR')
  }

  if (!user) {
    // Session valid but user deleted — clear the stale cookie
    return err('المستخدم غير موجود', 401, 'USER_NOT_FOUND')
  }

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

// Prevent Next.js from caching — always fresh
export const dynamic = 'force-dynamic'
