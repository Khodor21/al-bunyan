"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";

// Dynamically import the Emoji component from emoji-picker-react with SSR disabled
const UnifiedEmoji = dynamic(
  () => import("emoji-picker-react").then((mod) => mod.Emoji),
  { ssr: false },
);

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const isIOS = (): boolean =>
  typeof navigator !== "undefined" &&
  (/iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

const isInStandaloneMode = (): boolean =>
  typeof navigator !== "undefined" &&
  "standalone" in navigator &&
  (navigator as { standalone?: boolean }).standalone === true;

interface PlatformPillar {
  unified: string;
  title: string;
  badge: string;
}

const pillars: PlatformPillar[] = [
  {
    unified: "1f4d6", // 📖 Open Book
    title: "قراءة شرعية للأحداث",
    badge: "تأصيل شرعي",
  },
  {
    unified: "1f3db-fe0f", // 🏛️ Classical Building
    title: "بيان سنن الله في الأقوام",
    badge: "وعي تاريخي",
  },
  {
    unified: "1f6e1-fe0f", // 🛡️ Shield
    title: "مقاومة التفاهة والغثائية",
    badge: "بناء فكري",
  },
  {
    unified: "2696-fe0f", // ⚖️ Scales / Justice
    title: "بيان سبيل المجرمين",
    badge: "وعي وتحصين",
  },
];

export default function HomePage() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installOutcome, setInstallOutcome] = useState<
    "none" | "accepted" | "dismissed"
  >("none");
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPillarsModal, setShowPillarsModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setIsIOSDevice(isIOS());
    setIsStandalone(isInStandaloneMode());

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      triggerToast("جاري إعداد طلب التثبيت...");
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setInstallOutcome(outcome);
      setDeferredPrompt(null);
      if (outcome === "accepted") {
        triggerToast("تم تثبيت التطبيق بنجاح!");
      }
    } else if (isIOSDevice) {
      triggerToast("اضغط زر المشاركة ⬆️ ثم 'إضافة إلى الشاشة الرئيسية'");
    } else if (isStandalone) {
      triggerToast("التطبيق مثبت ومفعل حالياً على جهازك");
    } else {
      triggerToast("يرجى فتح الصفحة عبر Chrome أو Safari للتثبيت");
    }
  };

  const showAndroidInstall = deferredPrompt && installOutcome === "none";

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
      {/* ── Top Ambient Forest Blurred Glow ──────────────────────────────────── */}
      <div
        className="absolute -top-20 left-1/2 -translate-x-1/2 w-[120%] h-48 rounded-full blur-3xl pointer-events-none opacity-25 z-0"
        style={{
          background:
            "radial-gradient(ellipse at top, var(--color-forest) 0%, transparent 75%)",
        }}
      />

      {/* ── Toast Alert Banner ──────────────────────────────────────────────── */}
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
                borderColor: "rgba(255, 255, 255, 0.15)",
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

      {/* ── Main Hero Content Card (Animate In) ─────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mt-auto mb-8 flex flex-col items-start text-right max-w-md w-full z-10"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative mb-4 overflow-hidden flex items-center justify-center"
        >
          <Image
            src="/Logo.svg"
            alt="منصة البنيان المرصوص"
            width={200}
            height={200}
            className="object-cover"
            priority
          />
        </motion.div>

        <p
          className="text-sm leading-relaxed w-full mb-2"
          style={{
            fontFamily: "var(--font-sans-light)",
            color: "var(--color-darkest)",
          }}
        >
          رؤية شرعية لقضايا الأمة المعاصرة وقراءة استقراء تاريخي بعين القرآن
          والسنة
        </p>

        {isStandalone ? (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs border shadow-sm"
            style={{
              backgroundColor: "rgba(45, 74, 56, 0.08)",
              borderColor: "rgba(45, 74, 56, 0.15)",
              color: "var(--color-forest)",
            }}
          >
            <UnifiedEmoji unified="2705" size={14} />
            <span>التطبيق مثبت ويعمل بجودة كاملة</span>
          </motion.div>
        ) : (
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
            <span>تجربة تطبيق فوري بدون تحمـيل</span>
          </motion.div>
        )}
      </motion.section>

      {/* ── Bottom Floating Action Zone (Flex Column - Stored at Bottom) ────── */}
      <motion.footer
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md pb-4 flex flex-col gap-3 z-10"
      >
        {/* Button 1: Download Action with Framer Tap Effect */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleInstallClick}
          className="w-full py-3 px-5 rounded-2xl text-lg flex items-center justify-center gap-2.5 shadow-lg transition-all"
          style={{
            fontFamily: "var(--font-sans-medium)",
            backgroundColor: "var(--color-forest)",
            color: "var(--color-cream)",
          }}
        >
          <span>
            {showAndroidInstall
              ? "تحميــل التطبيــق"
              : isIOSDevice && !isStandalone
                ? "تحميــل التطبيـق على iOS"
                : "تحميـــل التطبيــق"}
          </span>
        </motion.button>

        {/* Button 2: Secondary Action (Platform Pillars) */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowPillarsModal(true)}
          className="w-full py-2 px-5 rounded-2xl text-lg font-bold border shadow-sm flex items-center justify-center gap-2.5 transition-all"
          style={{
            fontFamily: "var(--font-sans-light)",
            borderColor: "rgba(18, 30, 23, 0.2)",
            backgroundColor: "rgba(255, 255, 255, 0.6)",
            color: "var(--color-darkest)",
          }}
        >
          <span>أركان المنصة</span>
        </motion.button>
      </motion.footer>

      {/* ── Pillars Overlay Modal with Framer Motion AnimatePresence ─────────── */}
      <AnimatePresence>
        {showPillarsModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            {/* Modal Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPillarsModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-sm rounded-3xl p-6 border shadow-2xl flex flex-col gap-5 text-right relative z-10"
              style={{
                backgroundColor: "var(--color-cream)",
                borderColor: "rgba(18, 30, 23, 0.15)",
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
                  className="w-7 h-7 rounded-full bg-black/5 flex items-center justify-center text-xs text-[var(--color-darkest)] hover:bg-black/10"
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
                      <div>
                        <UnifiedEmoji unified={pillar.unified} size={24} />
                      </div>
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
                        borderColor: "rgba(45, 74, 56, 0.2)",
                        backgroundColor: "rgba(45, 74, 56, 0.05)",
                        color: "var(--color-forest)",
                      }}
                    >
                      {pillar.badge}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* iOS Helper instructions inside modal */}
              {isIOSDevice && !isStandalone && (
                <div
                  className="p-3 rounded-xl border text-[11px] leading-relaxed flex items-start gap-2"
                  style={{
                    backgroundColor: "rgba(45, 74, 56, 0.05)",
                    borderColor: "rgba(45, 74, 56, 0.15)",
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
