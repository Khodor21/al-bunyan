import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";
import { signSession, setSessionCookie } from "@/lib/session";
import {
  isValidName,
  isValidPhone,
  isValidCountryCode,
  isValidPassword,
  isValidLocation,
  err,
} from "@/lib/validation";
import type { AuthUser } from "@/types/auth";

export async function POST(req: NextRequest) {
  // ── 1. Parse body ──────────────────────────────────────────────────────────
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return err("Invalid JSON body", 400);
  }

  const { name, phone, countryCode, location, password } = body as Record<
    string,
    string
  >;

  // ── 2. Validate every field before touching the DB ─────────────────────────
  if (!isValidName(name))
    return err(
      "الاسم غير صالح — يجب أن يكون بين 2 و 120 حرفاً",
      422,
      "INVALID_NAME",
    );

  if (!isValidCountryCode(countryCode))
    return err("كود الدولة غير مدعوم", 422, "INVALID_COUNTRY_CODE");

  if (!isValidPhone(phone))
    return err(
      "رقم الهاتف غير صالح — أرقام فقط، من 7 إلى 12 خانة",
      422,
      "INVALID_PHONE",
    );

  if (!isValidLocation(location))
    return err(
      `الموقع الجغرافي غير صالح: "${location}"`,
      422,
      "INVALID_LOCATION",
    );

  if (!isValidPassword(password))
    return err(
      "كلمة المرور يجب أن تكون 8 أحرف على الأقل",
      422,
      "INVALID_PASSWORD",
    );

  const fullPhone = `${countryCode}${phone.trim()}`;

  try {
    // ── 3. Check phone uniqueness ────────────────────────────────────────────
    const { data: existing, error: lookupError } = await supabase
      .from("users")
      .select("id")
      .eq("full_phone", fullPhone)
      .maybeSingle();

    if (lookupError) {
      console.error("[signup] Lookup error:", lookupError);
      return err("خطأ في الخادم — تحقق من إعدادات Supabase", 500, "DB_ERROR");
    }

    if (existing) {
      return err("رقم الهاتف مسجّل مسبقاً", 409, "PHONE_TAKEN");
    }

    // ── 4. Hash password ─────────────────────────────────────────────────────
    const passwordHash = await bcrypt.hash(password, 12);

    // ── 5. Insert user ───────────────────────────────────────────────────────
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        name: name.trim(),
        phone: phone.trim(),
        country_code: countryCode,
        full_phone: fullPhone,
        location,
        password_hash: passwordHash,
        role: "user",
      })
      .select(
        "id, name, phone, country_code, full_phone, location, role, created_at",
      )
      .single();

    if (insertError || !newUser) {
      console.error("[signup] Insert error:", insertError);
      if (insertError?.code === "23505") {
        return err("رقم الهاتف مسجّل مسبقاً", 409, "PHONE_TAKEN");
      }
      return err(
        "خطأ في إنشاء الحساب — " + (insertError?.message ?? "unknown"),
        500,
        "DB_ERROR",
      );
    }

    // ── 6. Create session ────────────────────────────────────────────────────
    const token = await signSession(newUser.id, newUser.role);
    await setSessionCookie(token);

    const user: AuthUser = {
      id: newUser.id,
      name: newUser.name,
      phone: newUser.phone,
      countryCode: newUser.country_code,
      fullPhone: newUser.full_phone,
      location: newUser.location,
      role: newUser.role,
      createdAt: newUser.created_at,
    };

    return Response.json({ user }, { status: 201 });
  } catch (e) {
    // Catch-all so uncaught errors return JSON not an HTML 500 page
    console.error("[signup] Unexpected error:", e);
    return err(
      "خطأ غير متوقع في الخادم — راجع سجلات الطرفية",
      500,
      "UNEXPECTED",
    );
  }
}
