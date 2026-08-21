"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const UnifiedEmoji = dynamic(
  () => import("emoji-picker-react").then((mod) => mod.Emoji),
  { ssr: false },
);

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

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

interface Props {
  isIOSDevice: boolean;
  isStandalone: boolean;
  deferredPrompt: BeforeInstallPromptEvent | null;
  onInstallAccepted: () => void;
  triggerToast: (msg: string) => void;
}

export default function InstallView({
  isIOSDevice,
  isStandalone,
  deferredPrompt,
  onInstallAccepted,
  triggerToast,
}: Props) {
  const [showPillarsModal, setShowPillarsModal] = useState(false);
  const [installOutcome, setInstallOutcome] = useState<
    "none" | "accepted" | "dismissed"
  >("none");

  const showAndroidInstall = deferredPrompt && installOutcome === "none";

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setInstallOutcome(outcome);
      if (outcome === "accepted") {
        triggerToast("تم تثبيت التطبيق بنجاح!");
        onInstallAccepted();
      }
    } else if (isIOSDevice) {
      triggerToast("اضغط زر المشاركة ⬆️ ثم 'إضافة إلى الشاشة الرئيسية'");
    } else {
      triggerToast("يرجى فتح الصفحة عبر Chrome أو Safari للتثبيت");
    }
  };

  return (
    <div
      className="h-dvh w-screen flex flex-col justify-between relative overflow-hidden p-6 sm:p-8"
      dir="rtl"
      style={{
        backgroundColor: "var(--color-cream)",
        color: "var(--color-darkest)",
      }}
    >
      {/* Ambient glow */}
      <div
        className="absolute -top-20 left-1/2 -translate-x-1/2 w-[120%] h-48 rounded-full blur-3xl pointer-events-none opacity-20 z-0"
        style={{
          background:
            "radial-gradient(ellipse at top, var(--color-forest) 0%, transparent 75%)",
        }}
      />

      {/* Content */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mt-auto mb-6 flex flex-col items-start max-w-md w-full z-10"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-5"
        >
          <Image
            src="/Logo.svg"
            alt="منصة البنيان المرصوص"
            width={120}
            height={120}
            className="object-contain"
            priority
          />
        </motion.div>

        <p
          className="text-sm leading-loose mb-4 max-w-xs"
          style={{
            fontFamily: "var(--font-sans-light)",
            color: "var(--color-darkest)",
            opacity: 0.85,
          }}
        >
          رؤية شرعية لقضايا الأمة المعاصرة وقراءة استقراء تاريخي بعين القرآن
          والسنة
        </p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border"
          style={{
            borderColor: "rgba(90,101,59,0.15)",
            backgroundColor: "rgba(90,101,59,0.05)",
            color: "var(--color-forest)",
            fontFamily: "var(--font-sans-light)",
          }}
        >
          <UnifiedEmoji unified="1f4f1" size={13} />
          <span>تجربة تطبيق فوري بدون تحمّيل</span>
        </motion.div>
      </motion.section>

      {/* Buttons */}
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md pb-4 flex flex-col gap-2.5 z-10"
      >
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleInstallClick}
          className="w-full py-4 px-5 rounded-2xl text-base flex items-center justify-center shadow-sm"
          style={{
            fontFamily: "var(--font-sans-light)",
            backgroundColor: "var(--color-forest)",
            color: "var(--color-cream)",
          }}
        >
          {showAndroidInstall
            ? "تحميـل التطبيـق"
            : isIOSDevice
              ? "تحميـل التطبيـق على iOS"
              : "تحميـل التطبيـق"}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowPillarsModal(true)}
          className="w-full py-3.5 px-5 rounded-2xl text-base border flex items-center justify-center"
          style={{
            fontFamily: "var(--font-sans-light)",
            borderColor: "rgba(18,30,23,0.15)",
            backgroundColor: "rgba(255,255,255,0.5)",
            color: "var(--color-darkest)",
          }}
        >
          أركان المنصة
        </motion.button>
      </motion.footer>

      {/* Pillars Modal */}
      <AnimatePresence>
        {showPillarsModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPillarsModal(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 60, scale: 0.97 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="w-full max-w-sm rounded-3xl p-6 border shadow-2xl flex flex-col gap-4 text-right relative z-10"
              style={{
                backgroundColor: "var(--color-cream)",
                borderColor: "rgba(18,30,23,0.12)",
                color: "var(--color-darkest)",
              }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-black/8">
                <span
                  className="text-sm"
                  style={{ fontFamily: "var(--font-serif-bold)" }}
                >
                  أركان المنصة والأهداف
                </span>
                <button
                  onClick={() => setShowPillarsModal(false)}
                  className="w-7 h-7 rounded-full bg-black/5 flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col divide-y divide-black/5">
                {pillars.map((pillar, idx) => (
                  <motion.div
                    key={pillar.title}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.07 }}
                    className="py-3 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <UnifiedEmoji unified={pillar.unified} size={22} />
                      <span
                        className="text-xs"
                        style={{ fontFamily: "var(--font-sans-light)" }}
                      >
                        {pillar.title}
                      </span>
                    </div>
                    <span
                      className="text-[11px] px-2 py-0.5 rounded-full border flex-shrink-0"
                      style={{
                        borderColor: "rgba(90,101,59,0.2)",
                        backgroundColor: "rgba(90,101,59,0.05)",
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
                  className="p-3 rounded-xl text-[11px] leading-relaxed flex items-start gap-2 border"
                  style={{
                    backgroundColor: "rgba(90,101,59,0.04)",
                    borderColor: "rgba(90,101,59,0.12)",
                    color: "var(--color-forest)",
                  }}
                >
                  <UnifiedEmoji unified="1f4a1" size={13} />
                  <span>
                    للتثبيت على آيفون: اضغط زر المشاركة{" "}
                    <UnifiedEmoji unified="2b06-fe0f" size={11} /> ثم اختر
                    "إضافة إلى الشاشة الرئيسية"{" "}
                    <UnifiedEmoji unified="2795" size={11} />
                  </span>
                </div>
              )}

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowPillarsModal(false)}
                className="w-full py-3 rounded-xl text-xs text-center"
                style={{
                  backgroundColor: "var(--color-darkest)",
                  color: "var(--color-cream)",
                  fontFamily: "var(--font-sans-light)",
                }}
              >
                إغلاق
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
