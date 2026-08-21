"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";

const UnifiedEmoji = dynamic(
  () => import("emoji-picker-react").then((mod) => mod.Emoji),
  { ssr: false },
);

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface LocationOption {
  id: string;
  name: string;
  image: string;
}

interface UserProfile {
  name: string;
  phone: string;
  countryCode: string;
  location: string;
}

const locationsList: LocationOption[] = [
  { id: "loc-1", name: "المصر الأول", image: "/cities/جزيرة العرب.svg" },
  { id: "loc-2", name: "المصر الثاني", image: "/cities/بلاد الشام.svg" },
];

const countryCodes = [
  { code: "+966", label: "🇸🇦 +966" },
  { code: "+965", label: "🇰🇼 +965" },
  { code: "+971", label: "🇦🇪 +971" },
  { code: "+962", label: "🇯🇴 +962" },
  { code: "+961", label: "🇱🇧 +961" },
  { code: "+20", label: "🇪🇬 +20" },
];

const isIOS = (): boolean =>
  typeof navigator !== "undefined" &&
  (/iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

const isInStandaloneMode = (): boolean =>
  typeof navigator !== "undefined" &&
  "standalone" in navigator &&
  (navigator as { standalone?: boolean }).standalone === true;

// Also covers Chrome/Android installed PWA
const isStandaloneDisplay = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia("(display-mode: standalone)").matches;

interface PlatformPillar {
  unified: string;
  title: string;
  badge: string;
}

const pillars: PlatformPillar[] = [
  { unified: "1f4d6", title: "قراءة شرعية للأحداث", badge: "تأصيل شرعي" },
  {
    unified: "1f3db-fe0f",
    title: "بيان سنن الله في الأقوام",
    badge: "وعي تاريخي",
  },
  {
    unified: "1f6e1-fe0f",
    title: "مقاومة التفاهة والغثائية",
    badge: "بناء فكري",
  },
  { unified: "2696-fe0f", title: "بيان سبيل المجرمين", badge: "وعي وتحصين" },
];

// ─── View type ──────────────────────────────────────────────────────────────
// "loading"   : waiting for client-side detection (prevents hydration flash)
// "install"   : browser — show download/install page
// "login"     : installed PWA, no saved profile — show login form
// "home"      : installed PWA, profile exists — show welcome/home
type View = "loading" | "install" | "login" | "home";

export default function HomePage() {
  const [view, setView] = useState<View>("loading");
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installOutcome, setInstallOutcome] = useState<
    "none" | "accepted" | "dismissed"
  >("none");
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPillarsModal, setShowPillarsModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [countryCodeInput, setCountryCodeInput] = useState("+966");
  const [selectedLocation, setSelectedLocation] = useState<string>("loc-1");

  // ── One-time client detection on mount ─────────────────────────────────
  useEffect(() => {
    const ios = isIOS();
    const standalone = isInStandaloneMode() || isStandaloneDisplay();

    setIsIOSDevice(ios);
    setIsStandalone(standalone);

    // Try to restore saved profile
    let profile: UserProfile | null = null;
    try {
      const raw = localStorage.getItem("user_profile");
      if (raw) profile = JSON.parse(raw);
    } catch (e) {
      console.error("Failed to parse user_profile", e);
    }

    if (profile) setUserProfile(profile);

    // Decide which view to render now that we know the environment
    if (standalone) {
      setView(profile ? "home" : "login");
    } else {
      setView("install");
    }

    // Capture Android/Chrome install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      triggerToast("جاري إعداد طلب التثبيت...");
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setInstallOutcome(outcome);
      setDeferredPrompt(null);
      if (outcome === "accepted") triggerToast("تم تثبيت التطبيق بنجاح!");
    } else if (isIOSDevice) {
      triggerToast("اضغط زر المشاركة ⬆️ ثم 'إضافة إلى الشاشة الرئيسية'");
    } else if (isStandalone) {
      triggerToast("التطبيق مثبت ويعمل بجودة كاملة");
    } else {
      triggerToast("يرجى فتح الصفحة عبر Chrome أو Safari للتثبيت");
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      triggerToast("يرجى إدخال الاسم الكريم");
      return;
    }
    if (!phoneInput.trim()) {
      triggerToast("يرجى إدخال رقم الهاتف");
      return;
    }

    const profileData: UserProfile = {
      name: nameInput.trim(),
      phone: phoneInput.trim(),
      countryCode: countryCodeInput,
      location: selectedLocation,
    };

    localStorage.setItem("user_profile", JSON.stringify(profileData));
    setUserProfile(profileData);
    setView("home");
    triggerToast(`أهلاً بك يا ${profileData.name}`);
  };

  const handleClearProfile = () => {
    localStorage.removeItem("user_profile");
    setUserProfile(null);
    setNameInput("");
    setPhoneInput("");
    setView("login");
    triggerToast("تم تسجيل الخروج");
  };

  const showAndroidInstall = deferredPrompt && installOutcome === "none";

  // ── Render nothing until client detection completes (avoids flash) ──────
  if (view === "loading") return null;

  return (
    <main
      dir="rtl"
      className="h-dvh w-screen overflow-hidden flex flex-col justify-between p-6 sm:p-8 antialiased select-none text-right relative"
      style={{
        backgroundColor: "var(--color-cream)",
        color: "var(--color-darkest)",
        fontFamily: "var(--font-sans-light)",
      }}
    >
      {/* ── Top Ambient Glow ────────────────────────────────────────────── */}
      <div
        className="absolute -top-20 left-1/2 -translate-x-1/2 w-[120%] h-48 rounded-full blur-3xl pointer-events-none opacity-25 z-0"
        style={{
          background:
            "radial-gradient(ellipse at top, var(--color-forest) 0%, transparent 75%)",
        }}
      />

      {/* ── Toast ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-5 left-5 right-5 z-50 max-w-md mx-auto"
          >
            <div
              className="p-4 rounded-2xl shadow-2xl border flex items-center justify-between gap-3 text-xs font-medium backdrop-blur-md"
              style={{
                backgroundColor: "var(--color-darkest)",
                color: "var(--color-cream)",
                borderColor: "rgba(255,255,255,0.15)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <UnifiedEmoji unified="1f514" size={18} />
                <span>{toastMessage}</span>
              </div>
              <button
                onClick={() => setToastMessage(null)}
                className="opacity-70 hover:opacity-100 text-xs px-1"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════════════════
          VIEW: INSTALL  (browser — not installed yet)
      ════════════════════════════════════════════════════════════════════ */}
      {view === "install" && (
        <>
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mt-auto mb-6 flex flex-col items-start text-right max-w-md w-full z-10"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-4"
            >
              <Image
                src="/Logo.svg"
                alt="منصة البنيان المرصوص"
                width={140}
                height={140}
                className="object-cover"
                priority
              />
            </motion.div>

            <p
              className="text-sm leading-relaxed w-full mb-4"
              style={{
                fontFamily: "var(--font-sans-light)",
                color: "var(--color-darkest)",
              }}
            >
              رؤية شرعية لقضايا الأمة المعاصرة وقراءة استقراء تاريخي بعين القرآن
              والسنة
            </p>

            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs border shadow-sm"
              style={{
                backgroundColor: "rgba(45, 74, 56, 0.05)",
                borderColor: "rgba(45, 74, 56, 0.12)",
                color: "var(--color-darkest)",
              }}
            >
              <UnifiedEmoji unified="1f4f1" size={14} />
              <span>تجربة تطبيق فوري بدون تحمّيل</span>
            </motion.div>
          </motion.section>

          <motion.footer
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md pb-4 flex flex-col gap-3 z-10"
          >
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleInstallClick}
              className="w-full py-4 px-5 rounded-2xl text-lg flex items-center justify-center gap-2.5 shadow-lg"
              style={{
                fontFamily: "var(--font-sans-medium)",
                backgroundColor: "var(--color-forest)",
                color: "var(--color-cream)",
              }}
            >
              <span>
                {showAndroidInstall
                  ? "تحميــل التطبيـق"
                  : isIOSDevice
                    ? "تحميــل التطبيـق على iOS"
                    : "تحميـــل التطبيـق"}
              </span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowPillarsModal(true)}
              className="w-full py-3.5 px-5 rounded-2xl text-lg border shadow-sm flex items-center justify-center gap-2.5"
              style={{
                fontFamily: "var(--font-sans-light)",
                borderColor: "rgba(18, 30, 23, 0.2)",
                backgroundColor: "rgba(255,255,255,0.6)",
                color: "var(--color-darkest)",
              }}
            >
              <span>أركان المنصة</span>
            </motion.button>
          </motion.footer>
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          VIEW: LOGIN  (installed PWA — no profile yet)
      ════════════════════════════════════════════════════════════════════ */}
      {view === "login" && (
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-auto mb-6 flex flex-col items-start text-right max-w-md w-full z-10 overflow-y-auto max-h-[85dvh] pr-1"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-4"
          >
            <Image
              src="/Logo.svg"
              alt="منصة البنيان المرصوص"
              width={140}
              height={140}
              className="object-cover"
              priority
            />
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSaveProfile}
            className="w-full flex flex-col gap-3.5 my-2"
          >
            {/* Name */}
            <div className="flex flex-col gap-2">
              <span
                className="text-xs font-bold"
                style={{
                  fontFamily: "var(--font-sans-light)",
                  color: "var(--color-darkest)",
                }}
              >
                الاسـم الثنائــي{" "}
              </span>
              <input
                type="text"
                placeholder="أدخل اسمك هنا"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full py-2 px-3 rounded text-xs border outline-none transition-all focus:border-[var(--color-forest)] bg-white/70"
                style={{
                  borderColor: "rgba(18,30,23,0.15)",
                  color: "var(--color-darkest)",
                  fontFamily: "var(--font-sans-light)",
                }}
              />
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-2">
              <span
                className="text-xs font-bold"
                style={{
                  fontFamily: "var(--font-sans-light)",
                  color: "var(--color-darkest)",
                }}
              >
                رقـم الهاتِـف
              </span>
              <div className="flex gap-2">
                <select
                  value={countryCodeInput}
                  onChange={(e) => setCountryCodeInput(e.target.value)}
                  className="py-2 px-2 rounded text-xs border outline-none bg-white/70"
                  style={{
                    borderColor: "rgba(18,30,23,0.15)",
                    color: "var(--color-darkest)",
                    fontFamily: "var(--font-sans-medium)",
                  }}
                >
                  {countryCodes.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  placeholder="50XXXXXXX"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full py-2 px-3 rounded text-xs border outline-none text-right transition-all focus:border-[var(--color-forest)] bg-white/70"
                  style={{
                    borderColor: "rgba(18,30,23,0.15)",
                    color: "var(--color-darkest)",
                    fontFamily: "var(--font-sans-light)",
                  }}
                />
              </div>
            </div>

            {/* Location */}
            <div className="flex flex-col gap-1.5 mt-2">
              <span
                className="text-sm mb-1"
                style={{
                  fontFamily: "var(--font-sans-light)",
                  color: "var(--color-darkest)",
                }}
              >
                اختر المصر الذي تعيش فيه
              </span>
              <div className="grid grid-cols-2 gap-3">
                {locationsList.map((loc) => {
                  const isSelected = selectedLocation === loc.id;
                  return (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => setSelectedLocation(loc.id)}
                      className={`border border-[1px] w-fit`}
                      style={{
                        borderColor: isSelected
                          ? "var(--color-forest)"
                          : "rgba(18,30,23,0.12)",
                      }}
                    >
                      <div className="flex items-center justify-center">
                        <Image
                          src={loc.image}
                          alt={loc.name}
                          width={200}
                          height={200}
                          className="object-contain"
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl text-xs font-bold mt-2 shadow-md"
              style={{
                backgroundColor: "var(--color-forest)",
                color: "var(--color-cream)",
                fontFamily: "var(--font-sans-bold)",
              }}
            >
              دخول التطبيق
            </motion.button>
          </motion.form>
        </motion.section>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          VIEW: HOME  (installed PWA — profile exists)
      ════════════════════════════════════════════════════════════════════ */}
      {view === "home" && userProfile && (
        <>
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mt-auto mb-6 flex flex-col items-start text-right max-w-md w-full z-10"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-3"
            >
              <Image
                src="/Logo.svg"
                alt="منصة البنيان المرصوص"
                width={140}
                height={140}
                className="object-cover"
                priority
              />
            </motion.div>

            <p
              className="text-sm leading-relaxed w-full mb-3"
              style={{
                fontFamily: "var(--font-sans-light)",
                color: "var(--color-darkest)",
              }}
            >
              رؤية شرعية لقضايا الأمة المعاصرة وقراءة استقراء تاريخي بعين القرآن
              والسنة
            </p>
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-1 text-xs mb-2"
              style={{
                color: "var(--color-forest)",
              }}
            >
              <UnifiedEmoji unified="2705" size={14} />
              <span>التطبيق مثبت ويعمل بجودة كاملة</span>
            </motion.div>
            {/* Profile card */}
            <div className="w-full p-3 rounded-xl border mb-3 bg-white/50 border-black/10 flex items-center justify-between">
              <div>
                <p
                  className="text-xs font-bold"
                  style={{ color: "var(--color-darkest)" }}
                >
                  مرحباً، {userProfile.name}
                </p>
                {/* <p
                  className="text-[10px] opacity-75"
                  style={{ color: "var(--color-forest)" }}
                >
                  {userProfile.countryCode} {userProfile.phone} |{" "}
                  {
                    locationsList.find((l) => l.id === userProfile.location)
                      ?.name
                  }
                </p> */}
              </div>
              {/* <button
                onClick={handleClearProfile}
                className="text-[10px] underline text-red-600 px-2"
              >
                إعادة تعيين
              </button> */}
            </div>
          </motion.section>

          <motion.footer
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md pb-4 flex flex-col gap-3 z-10"
          >
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowPillarsModal(true)}
              className="w-full py-3.5 px-5 rounded-2xl text-lg border shadow-sm flex items-center justify-center gap-2.5"
              style={{
                fontFamily: "var(--font-sans-light)",
                borderColor: "rgba(18,30,23,0.2)",
                backgroundColor: "rgba(255,255,255,0.6)",
                color: "var(--color-darkest)",
              }}
            >
              <span>أركان المنصة</span>
            </motion.button>
          </motion.footer>
        </>
      )}

      {/* ── Pillars Modal (shared across all views) ─────────────────────── */}
      <AnimatePresence>
        {showPillarsModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPillarsModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-sm rounded-3xl p-6 border shadow-2xl flex flex-col gap-5 text-right relative z-10"
              style={{
                backgroundColor: "var(--color-cream)",
                borderColor: "rgba(18,30,23,0.15)",
                color: "var(--color-darkest)",
              }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-black/10">
                <span
                  className="text-sm font-bold"
                  style={{
                    fontFamily: "var(--font-serif-bold)",
                    color: "var(--color-darkest)",
                  }}
                >
                  أركان المنصة والأهداف
                </span>
                <button
                  onClick={() => setShowPillarsModal(false)}
                  className="w-7 h-7 rounded-full bg-black/5 flex items-center justify-center text-xs hover:bg-black/10"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {pillars.map((pillar, idx) => (
                  <motion.div
                    key={pillar.title}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="py-3.5 flex items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <UnifiedEmoji unified={pillar.unified} size={24} />
                      <span
                        className="text-xs"
                        style={{ fontFamily: "var(--font-sans-light)" }}
                      >
                        {pillar.title}
                      </span>
                    </div>
                    <span
                      className="text-[12px] px-2.5 py-0.5 rounded-full border"
                      style={{
                        borderColor: "rgba(45,74,56,0.2)",
                        backgroundColor: "rgba(45,74,56,0.05)",
                        color: "var(--color-forest)",
                      }}
                    >
                      {pillar.badge}
                    </span>
                  </motion.div>
                ))}
              </div>

              {isIOSDevice && !isStandalone && (
                <div
                  className="p-3 rounded-xl border text-[11px] leading-relaxed flex items-start gap-2"
                  style={{
                    backgroundColor: "rgba(45,74,56,0.05)",
                    borderColor: "rgba(45,74,56,0.15)",
                    color: "var(--color-forest)",
                  }}
                >
                  <UnifiedEmoji unified="1f4a1" size={14} />
                  <span>
                    للتثبيت على آيفون: اضغط زر المشاركة{" "}
                    <UnifiedEmoji unified="2b06-fe0f" size={12} /> ثم اختر
                    "إضافة إلى الشاشة الرئيسية"{" "}
                    <UnifiedEmoji unified="2795" size={12} />.
                  </span>
                </div>
              )}

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowPillarsModal(false)}
                className="w-full py-3 rounded-xl text-xs font-bold text-center mt-1"
                style={{
                  backgroundColor: "var(--color-darkest)",
                  color: "var(--color-cream)",
                  fontFamily: "var(--font-sans-bold)",
                }}
              >
                إغلاق
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
