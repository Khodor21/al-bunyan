"use client";

import { useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import type { AuthUser } from "@/types/auth";

const UnifiedEmoji = dynamic(
  () => import("emoji-picker-react").then((mod) => mod.Emoji),
  { ssr: false },
);

interface LocationOption {
  id: string;
  name: string;
  image: string;
}

export type { AuthUser };

const locationsList: LocationOption[] = [
  { id: "loc-1", name: "Saudia", image: "/cities/جزيرة العرب.svg" },
  { id: "loc-2", name: "Al-Sham", image: "/cities/بلاد الشام.svg" },
  { id: "loc-4", name: "Egypt", image: "/cities/مصر.svg" },
  { id: "loc-3", name: "Morocco", image: "/cities/بلاد المغرب.svg" },
  { id: "loc-5", name: "Al-Neel", image: "/cities/وادي النيل.svg" },
  { id: "loc-6", name: "Iraq", image: "/cities/العراق.svg" },
];

const countryCodes = [
  { code: "+966", label: "🇸🇦 +966" },
  { code: "+965", label: "🇰🇼 +965" },
  { code: "+971", label: "🇦🇪 +971" },
  { code: "+962", label: "🇯🇴 +962" },
  { code: "+961", label: "🇱🇧 +961" },
  { code: "+20", label: "🇪🇬 +20" },
];

// ─── Styles ───────────────────────────────────────────────────────────────────
const inputCls =
  "w-full py-3.5 px-4 rounded-xl text-sm border outline-none transition-all duration-200 focus:border-[var(--color-forest)] focus:ring-2 focus:ring-[var(--color-forest)]/20 bg-white/80 shadow-sm";

const inputSt: React.CSSProperties = {
  borderColor: "rgba(18,30,23,0.15)",
  color: "var(--color-darkest)",
  fontFamily: "var(--font-sans-light)",
};

const labelSt: React.CSSProperties = {
  fontFamily: "var(--font-sans-medium)",
  color: "var(--color-darkest)",
  fontSize: "0.95rem",
};

const primaryBtnSt: React.CSSProperties = {
  backgroundColor: "var(--color-forest)",
  color: "var(--color-cream)",
  fontFamily: "var(--font-sans-medium)",
};

// ─── Step indicator dots ──────────────────────────────────────────────────────
function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1.5 items-center">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width: i === current ? 20 : 6,
            height: 6,
            backgroundColor:
              i === current
                ? "var(--color-forest)"
                : i < current
                  ? "rgba(90,101,59,0.35)"
                  : "rgba(18,30,23,0.12)",
          }}
        />
      ))}
    </div>
  );
}

// ─── Password strength ───────────────────────────────────────────────────────
function passwordStrength(pw: string): {
  level: number;
  label: string;
  color: string;
} {
  if (pw.length === 0) return { level: 0, label: "", color: "transparent" };
  if (pw.length < 8) return { level: 1, label: "ضعيفة", color: "#ef4444" };
  if (pw.length < 12) return { level: 2, label: "متوسطة", color: "#f59e0b" };
  return { level: 3, label: "قوية", color: "#22c55e" };
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  onSave: (user: AuthUser) => void;
  triggerToast: (msg: string) => void;
}

// ─── Signup step type ─────────────────────────────────────────────────────────
type SignupStep = "info" | "location" | "password";
type Mode = "signup" | "login";

export default function LoginView({ onSave, triggerToast }: Props) {
  const [mode, setMode] = useState<Mode>("signup");
  const [step, setStep] = useState<SignupStep>("info");
  const [loading, setLoading] = useState(false);

  // Signup fields
  const [nameInput, setNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [countryCodeInput, setCountryCode] = useState("+966");
  const [selectedLocation, setLocation] = useState("loc-1");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Login fields (reuse phone/code from above)
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPw, setShowLoginPw] = useState(false);

  // ── helpers ────────────────────────────────────────────────────────────────
  const switchMode = (m: Mode) => {
    setMode(m);
    setStep("info");
    setLoading(false);
  };

  const selectedLoc = locationsList.find((l) => l.id === selectedLocation)!;
  const pwStrength = passwordStrength(password);

  // ── Step 1 → 2 ────────────────────────────────────────────────────────────
  const handleInfoNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      triggerToast("يرجى إدخال الاسم");
      return;
    }
    if (!phoneInput.trim()) {
      triggerToast("يرجى إدخال رقم الهاتف");
      return;
    }
    if (!/^\d{7,12}$/.test(phoneInput.trim())) {
      triggerToast("رقم الهاتف يجب أن يحتوي على أرقام فقط (7-12 خانة)");
      return;
    }
    setStep("location");
  };

  // ── Step 2 → 3 ────────────────────────────────────────────────────────────
  const handleLocationNext = () => setStep("password");

  // ── Step 3: submit signup ─────────────────────────────────────────────────
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      triggerToast("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      return;
    }
    if (password !== confirmPassword) {
      triggerToast("كلمتا المرور غير متطابقتين");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameInput.trim(),
          phone: phoneInput.trim(),
          countryCode: countryCodeInput,
          location: selectedLoc.name,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        triggerToast(data.error ?? "خطأ في إنشاء الحساب");
        return;
      }

      onSave(data.user);
    } catch {
      triggerToast("خطأ في الاتصال — تحقق من الإنترنت");
    } finally {
      setLoading(false);
    }
  };

  // ── Login submit ──────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput.trim()) {
      triggerToast("يرجى إدخال رقم الهاتف");
      return;
    }
    if (!loginPassword) {
      triggerToast("يرجى إدخال كلمة المرور");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phoneInput.trim(),
          countryCode: countryCodeInput,
          password: loginPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        triggerToast(data.error ?? "بيانات الدخول غير صحيحة");
        return;
      }

      onSave(data.user);
    } catch {
      triggerToast("خطأ في الاتصال — تحقق من الإنترنت");
    } finally {
      setLoading(false);
    }
  };

  // ── Step label for header ─────────────────────────────────────────────────
  const stepIndex = step === "info" ? 0 : step === "location" ? 1 : 2;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="h-dvh w-screen flex flex-col relative overflow-hidden"
      style={{ backgroundColor: "var(--color-cream)" }}
    >
      {/* ── Scrollable form area (Everything Bottom Aligned) ─────────────── */}
      <div
        className="flex-1 overflow-y-auto flex flex-col px-6 relative"
        dir="rtl"
      >
        {/* Dynamic spacer to push ALL content down to the bottom */}
        <div className="flex-1 min-h-[3rem]"></div>

        {/* Cohesive Bottom-Aligned Container */}
        <div className="w-full flex flex-col gap-6 pb-[130px] pt-4">
          {/* ── Logo ──────────────────────────────────────────────────────── */}
          <div className="flex justify-end" dir="ltr">
            <Image
              src="/Logo.svg"
              alt="منصة البنيان المرصوص"
              width={140}
              height={140}
              className="object-contain"
              priority
            />
          </div>

          {/* ── Mode tabs ─────────────────────────────────────────────────── */}
          <div>
            <div
              className="inline-flex rounded-xl p-1 gap-1"
              style={{ backgroundColor: "rgba(18,30,23,0.06)" }}
            >
              {(["signup", "login"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className="px-6 py-2 rounded-lg text-sm transition-all duration-200"
                  style={{
                    fontFamily: "var(--font-sans-medium)",
                    backgroundColor:
                      mode === m ? "var(--color-forest)" : "transparent",
                    color:
                      mode === m
                        ? "var(--color-cream)"
                        : "var(--color-darkest)",
                    boxShadow:
                      mode === m ? "0 2px 4px rgba(18,30,23,0.1)" : "none",
                  }}
                >
                  {m === "signup" ? "حساب جديد" : "تسجيل الدخول"}
                </button>
              ))}
            </div>

            {/* Step dots — only during signup */}
            {mode === "signup" && (
              <div className="mt-4">
                <StepDots current={stepIndex} total={3} />
              </div>
            )}
          </div>

          {/* ── Form Area ─────────────────────────────────────────────────── */}
          <AnimatePresence mode="wait">
            {/* ══════════════════════════════════════════════════════════════
                SIGNUP — STEP 1: Name & Phone
            ══════════════════════════════════════════════════════════════ */}
            {mode === "signup" && step === "info" && (
              <motion.form
                key="signup-info"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                onSubmit={handleInfoNext}
                className="flex flex-col gap-5"
              >
                {/* Name */}
                <div className="flex flex-col gap-2">
                  <label style={labelSt}>الاسـم</label>
                  <div
                    className="inline-flex items-center gap-1 text-xs w-fit"
                    style={{
                      color: "var(--color-forest)",
                      fontFamily: "var(--font-sans-light)",
                    }}
                  >
                    <UnifiedEmoji unified="1f4a1" size={14} />
                    <span>
                      اكتب:{" "}
                      <strong style={{ fontFamily: "var(--font-sans-medium)" }}>
                        اسمك بن اسم والدك
                      </strong>{" "}
                      على طريقة العرب
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="مثال: عبدالله بن محمد"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className={inputCls}
                    style={inputSt}
                    autoComplete="name"
                  />
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-2 mt-1">
                  <label style={labelSt}>رقـم الهاتِـف</label>
                  <div className="flex flex-row-reverse gap-2" dir="ltr">
                    <select
                      value={countryCodeInput}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="py-3.5 px-3 rounded-xl text-xs border outline-none flex-shrink-0 bg-white/80 shadow-sm transition-all focus:border-[var(--color-forest)] focus:ring-2 focus:ring-[var(--color-forest)]/20"
                      style={inputSt}
                    >
                      {countryCodes.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      placeholder="5XXXXXXXX"
                      value={phoneInput}
                      onChange={(e) =>
                        setPhoneInput(e.target.value.replace(/\D/g, ""))
                      }
                      className={inputCls}
                      style={{ ...inputSt, textAlign: "left" }}
                      autoComplete="tel"
                      inputMode="numeric"
                    />
                  </div>
                </div>

                <button type="submit" className="hidden" />
              </motion.form>
            )}

            {/* ══════════════════════════════════════════════════════════════
                SIGNUP — STEP 2: Location grid
            ══════════════════════════════════════════════════════════════ */}
            {mode === "signup" && step === "location" && (
              <motion.div
                key="signup-location"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-4"
                dir="rtl"
              >
                <p style={labelSt}>اختـر المِصــر الذي تعيـش فيـه</p>

                <div className="grid grid-cols-2 gap-3">
                  {locationsList.map((loc) => {
                    const isSelected = selectedLocation === loc.id;
                    return (
                      <motion.button
                        key={loc.id}
                        type="button"
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setLocation(loc.id)}
                        className="relative overflow-hidden rounded transition-all duration-200"
                        style={{
                          borderColor: isSelected
                            ? "var(--color-forest)"
                            : "rgba(18,30,23,0.1)",
                          backgroundColor: isSelected
                            ? "rgba(90,101,59,0.06)"
                            : "rgba(255,255,255,0.7)",
                          borderWidth: isSelected ? "2px" : "0px",
                          boxShadow: isSelected
                            ? "0 4px 12px rgba(90,101,59,0.1)"
                            : "0 2px 4px rgba(0,0,0,0.02)",
                        }}
                      >
                        {/* Checkmark */}
                        {isSelected && (
                          <motion.div
                            layoutId="locCheck"
                            className="absolute top-2 left-2 w-5 h-5 rounded-full flex items-center justify-center z-10 shadow-sm"
                            style={{ backgroundColor: "var(--color-forest)" }}
                          >
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 8 8"
                              fill="none"
                            >
                              <path
                                d="M1.5 4L3 5.5L6.5 2"
                                stroke="white"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </motion.div>
                        )}

                        <div className="w-full aspect-[3/4] flex items-center justify-center">
                          <Image
                            src={loc.image}
                            alt={loc.name}
                            width={200}
                            height={220}
                            className="object-contain w-full h-fit transition-transform duration-300"
                            style={{
                              transform: isSelected
                                ? "scale(1.05)"
                                : "scale(1)",
                            }}
                          />
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                SIGNUP — STEP 3: Password
            ══════════════════════════════════════════════════════════════ */}
            {mode === "signup" && step === "password" && (
              <motion.form
                key="signup-password"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                onSubmit={handleSignup}
                className="flex flex-col gap-6"
              >
                {/* Password */}
                <div className="flex flex-col gap-2">
                  <label style={labelSt}>كلمة المرور</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      placeholder="8 أحرف على الأقل"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={inputCls}
                      style={{ ...inputSt, paddingLeft: "3.5rem" }}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity text-xs font-medium"
                      style={{ color: "var(--color-darkest)" }}
                    >
                      {showPw ? "إخفاء" : "إظهار"}
                    </button>
                  </div>

                  {/* Strength bar */}
                  {password.length > 0 && (
                    <div className="flex items-center gap-3 mt-1 px-1">
                      <div className="flex gap-1.5 flex-1">
                        {[1, 2, 3].map((lvl) => (
                          <div
                            key={lvl}
                            className="h-1.5 flex-1 rounded-full transition-all duration-300"
                            style={{
                              backgroundColor:
                                pwStrength.level >= lvl
                                  ? pwStrength.color
                                  : "rgba(18,30,23,0.1)",
                            }}
                          />
                        ))}
                      </div>
                      <span
                        className="text-xs font-medium w-12 text-center"
                        style={{
                          color: pwStrength.color,
                          fontFamily: "var(--font-sans-medium)",
                        }}
                      >
                        {pwStrength.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div className="flex flex-col gap-2 mb-12">
                  <label style={labelSt}>تأكيد كلمة المرور</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="أعد كتابة كلمة المرور"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      className={inputCls}
                      style={{
                        ...inputSt,
                        paddingLeft: "3.5rem",
                        borderColor:
                          confirmPassword && confirmPassword !== password
                            ? "#ef4444"
                            : confirmPassword && confirmPassword === password
                              ? "#22c55e"
                              : inputSt.borderColor,
                      }}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity text-xs font-medium"
                      style={{ color: "var(--color-darkest)" }}
                    >
                      {showConfirm ? "إخفاء" : "إظهار"}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== password && (
                    <p
                      className="text-xs mt-1 px-1"
                      style={{
                        color: "#ef4444",
                        fontFamily: "var(--font-sans-medium)",
                      }}
                    >
                      كلمتا المرور غير متطابقتين
                    </p>
                  )}
                </div>

                <button type="submit" className="hidden" />
              </motion.form>
            )}

            {/* ══════════════════════════════════════════════════════════════
                LOGIN form
            ══════════════════════════════════════════════════════════════ */}
            {mode === "login" && (
              <motion.form
                key="login-form"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                onSubmit={handleLogin}
                className="flex flex-col gap-5"
              >
                {/* Phone */}
                <div className="flex flex-col gap-2">
                  <label style={labelSt}>رقـم الهاتِـف</label>
                  <div className="flex flex-row-reverse gap-2" dir="ltr">
                    <select
                      value={countryCodeInput}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="py-3.5 px-3 rounded-xl text-xs border outline-none flex-shrink-0 bg-white/80 shadow-sm transition-all focus:border-[var(--color-forest)] focus:ring-2 focus:ring-[var(--color-forest)]/20"
                      style={inputSt}
                    >
                      {countryCodes.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      placeholder="5XXXXXXXX"
                      value={phoneInput}
                      onChange={(e) =>
                        setPhoneInput(e.target.value.replace(/\D/g, ""))
                      }
                      className={inputCls}
                      style={{ ...inputSt, textAlign: "left" }}
                      autoComplete="tel"
                      inputMode="numeric"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="flex flex-col gap-2 mt-1">
                  <label style={labelSt}>كلمة المرور</label>
                  <div className="relative">
                    <input
                      type={showLoginPw ? "text" : "password"}
                      placeholder="كلمة المرور"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className={inputCls}
                      style={{ ...inputSt, paddingLeft: "3.5rem" }}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPw((v) => !v)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity text-xs font-medium"
                      style={{ color: "var(--color-darkest)" }}
                    >
                      {showLoginPw ? "إخفاء" : "إظهار"}
                    </button>
                  </div>
                </div>

                <button type="submit" className="hidden" />
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Fixed bottom action bar ─────────────────────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 px-6 pb-8 pt-6 z-20 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, var(--color-cream) 80%, rgba(246,244,238,0))",
        }}
      >
        <div className="pointer-events-auto">
          <AnimatePresence mode="wait">
            {/* Signup step 1 */}
            {mode === "signup" && step === "info" && (
              <motion.button
                key="btn-info-next"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleInfoNext as unknown as React.MouseEventHandler}
                className="w-full py-2.5 rounded-xl text-base shadow-lg transition-shadow"
                style={primaryBtnSt}
              >
                التالـي
              </motion.button>
            )}

            {/* Signup step 2 */}
            {mode === "signup" && step === "location" && (
              <motion.div
                key="btn-location"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="flex flex-col gap-3"
              >
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleLocationNext}
                  className="w-full py-2.5 rounded-xl text-base shadow-lg transition-shadow"
                  style={primaryBtnSt}
                >
                  التالـي
                </motion.button>
                <button
                  onClick={() => setStep("info")}
                  className="w-full py-1 text-sm text-center opacity-50 hover:opacity-100 transition-opacity"
                  style={{
                    fontFamily: "var(--font-sans-medium)",
                    color: "var(--color-darkest)",
                  }}
                >
                  رجوع
                </button>
              </motion.div>
            )}

            {/* Signup step 3 */}
            {mode === "signup" && step === "password" && (
              <motion.div
                key="btn-password"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="flex flex-col gap-3"
              >
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSignup as unknown as React.MouseEventHandler}
                  disabled={loading}
                  className="w-full py-2 rounded-xl text-base shadow-lg transition-shadow disabled:opacity-60 disabled:shadow-none"
                  style={primaryBtnSt}
                >
                  {loading ? "جاري الإنشاء..." : "إنشاء الحساب"}
                </motion.button>
                <button
                  onClick={() => setStep("location")}
                  disabled={loading}
                  className="w-full py-1 text-sm text-center opacity-50 hover:opacity-100 transition-opacity disabled:opacity-20"
                  style={{
                    fontFamily: "var(--font-sans-medium)",
                    color: "var(--color-darkest)",
                  }}
                >
                  رجوع
                </button>
              </motion.div>
            )}

            {/* Login */}
            {mode === "login" && (
              <motion.button
                key="btn-login"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleLogin as unknown as React.MouseEventHandler}
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-base shadow-lg transition-shadow disabled:opacity-60 disabled:shadow-none"
                style={primaryBtnSt}
              >
                {loading ? "جاري الدخول..." : "دخول"}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
