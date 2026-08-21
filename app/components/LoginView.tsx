"use client";

import { useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";

const UnifiedEmoji = dynamic(
  () => import("emoji-picker-react").then((mod) => mod.Emoji),
  { ssr: false },
);

interface LocationOption {
  id: string;
  name: string;
  image: string;
}

export interface UserProfile {
  name: string;
  phone: string;
  countryCode: string;
  location: string;
}

const locationsList: LocationOption[] = [
  { id: "loc-1", name: "المصر الأول", image: "/cities/جزيرة العرب.svg" },
  { id: "loc-2", name: "المصر الثاني", image: "/cities/بلاد الشام.svg" },
  { id: "loc-4", name: "المصر الرابع", image: "/cities/مصر.svg" },
  { id: "loc-3", name: "المصر الثالث", image: "/cities/بلاد المغرب.svg" },
  { id: "loc-5", name: "المصر الخامس", image: "/cities/وادي النيل.svg" },
  { id: "loc-6", name: "المصر السادس", image: "/cities/العراق.svg" },
];

const countryCodes = [
  { code: "+966", label: "🇸🇦 +966" },
  { code: "+965", label: "🇰🇼 +965" },
  { code: "+971", label: "🇦🇪 +971" },
  { code: "+962", label: "🇯🇴 +962" },
  { code: "+961", label: "🇱🇧 +961" },
  { code: "+20", label: "🇪🇬 +20" },
];

// ─── Shared input style ───────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  borderColor: "rgba(18,30,23,0.15)",
  color: "var(--color-darkest)",
  fontFamily: "var(--font-sans-light)",
  backgroundColor: "rgba(255,255,255,0.7)",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-sans-medium)",
  color: "var(--color-darkest)",
  fontSize: "1rem",
};

// ─── Step type ────────────────────────────────────────────────────────────────
type Step = "info" | "location";

interface Props {
  onSave: (profile: UserProfile) => void;
  triggerToast: (msg: string) => void;
}

export default function LoginView({ onSave, triggerToast }: Props) {
  const [step, setStep] = useState<Step>("info");
  const [nameInput, setNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [countryCodeInput, setCountryCodeInput] = useState("+966");
  const [selectedLocation, setSelectedLocation] = useState<string>("loc-1");

  // ── Step 1: validate info then advance ───────────────────────────────────
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
    setStep("location");
  };

  // ── Step 2: save and finish ───────────────────────────────────────────────
  const handleLocationSubmit = () => {
    const profileData: UserProfile = {
      name: nameInput.trim(),
      phone: phoneInput.trim(),
      countryCode: countryCodeInput,
      location: selectedLocation,
    };
    localStorage.setItem("user_profile", JSON.stringify(profileData));
    onSave(profileData);
  };

  return (
    <div
      className="h-dvh w-screen flex flex-col relative overflow-hidden"
      style={{ backgroundColor: "var(--color-cream)" }}
    >
      {/* ── Fixed logo at top ─────────────────────────────────────────────── */}
      <div className="flex-shrink-0 pt-10 pb-4 flex justify-start px-6">
        <Image
          src="/Logo.svg"
          alt="منصة البنيان المرصوص"
          width={96}
          height={96}
          className="object-contain"
          priority
        />
      </div>

      {/* ── Scrollable content area ───────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 pb-32" dir="rtl">
        <AnimatePresence mode="wait">
          {/* ════ STEP 1: Name & Phone ════ */}
          {step === "info" && (
            <motion.form
              key="info"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onSubmit={handleInfoNext}
              className="flex flex-col gap-6 pt-2"
            >
              {/* Name field */}
              <div className="flex flex-col gap-2">
                <label style={labelStyle}>الاسـم</label>

                {/* Guidance chip */}
                <div
                  className="inline-flex items-center gap-1.5 text-xs  rounded-lg w-fit"
                  style={{
                    color: "var(--color-forest)",
                    fontFamily: "var(--font-sans-light)",
                  }}
                >
                  <UnifiedEmoji unified="1f4a1" size={12} />
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
                  className="w-full py-2.5 px-3 rounded-lg text-sm border outline-none transition-colors focus:border-[var(--color-forest)]"
                  style={inputStyle}
                  autoComplete="name"
                />
              </div>

              {/* Phone field */}
              <div className="flex flex-col gap-2">
                <label style={labelStyle}>رقـم الهاتِـف</label>
                <div className="flex flex-row-reverse gap-2" dir="ltr">
                  <select
                    value={countryCodeInput}
                    onChange={(e) => setCountryCodeInput(e.target.value)}
                    className="py-2.5 px-2 rounded-lg text-xs border outline-none flex-shrink-0"
                    style={inputStyle}
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
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="flex-1 py-2.5 px-3 rounded-lg text-sm border outline-none transition-colors focus:border-[var(--color-forest)]"
                    style={{ ...inputStyle, textAlign: "left" }}
                    autoComplete="tel"
                  />
                </div>
              </div>

              {/* Hidden submit so Enter key works */}
              <button type="submit" className="hidden" />
            </motion.form>
          )}

          {/* ════ STEP 2: Location grid ════ */}
          {step === "location" && (
            <motion.div
              key="location"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-4 pt-2"
              dir="rtl"
            >
              <p style={{ ...labelStyle, fontSize: "1rem" }}>
                اختـر المِصــر الذي تعيـش فيـه
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                {locationsList.map((loc) => {
                  const isSelected = selectedLocation === loc.id;
                  return (
                    <motion.button
                      key={loc.id}
                      type="button"
                      whileTap={{ scale: 1.05 }}
                      onClick={() => setSelectedLocation(loc.id)}
                      className="relative overflow-hidden rounded border transition-all"
                      style={{
                        borderColor: isSelected ? "var(--color-forest)" : "",
                        backgroundColor: isSelected
                          ? "rgba(90,101,59,0.06)"
                          : "rgba(255,255,255,0.5)",
                        borderWidth: isSelected ? "1.5px" : "0px",
                      }}
                    >
                      <div className="w-full aspect-[3/4] flex items-center justify-center">
                        <Image
                          src={loc.image}
                          alt={loc.name}
                          width={200}
                          height={220}
                          className="object-contain w-full h-fit "
                        />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Fixed bottom action ───────────────────────────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 px-6 pb-8 pt-4 z-20"
        style={{
          background:
            "linear-gradient(to top, var(--color-cream) 75%, transparent)",
        }}
      >
        <AnimatePresence mode="wait">
          {step === "info" ? (
            <motion.button
              key="next-btn"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleInfoNext as unknown as React.MouseEventHandler}
              className="w-full py-3 rounded text-base text-center"
              style={{
                backgroundColor: "var(--color-forest)",
                color: "var(--color-cream)",
                fontFamily: "var(--font-sans-light)",
              }}
            >
              التالـــي
            </motion.button>
          ) : (
            <motion.div
              key="location-btns"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex flex-col gap-2"
            >
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleLocationSubmit}
                className="w-full py-3.5 rounded text-base text-center"
                style={{
                  backgroundColor: "var(--color-forest)",
                  color: "var(--color-cream)",
                  fontFamily: "var(--font-sans-light)",
                }}
              >
                دخول التطبيق
              </motion.button>
              <button
                onClick={() => setStep("info")}
                className="w-full py-2 text-xs text-center opacity-50"
                style={{
                  fontFamily: "var(--font-sans-light)",
                  color: "var(--color-darkest)",
                }}
              >
                رجوع
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
