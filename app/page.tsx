"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { UserProfile } from "./components/LoginView";

const UnifiedEmoji = dynamic(
  () => import("emoji-picker-react").then((mod) => mod.Emoji),
  { ssr: false },
);

// Lazy-load each view so the install bundle stays small
const InstallView = dynamic(() => import("./components/InstallView"), {
  ssr: false,
});
const LoginView = dynamic(() => import("./components/LoginView"), {
  ssr: false,
});

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

const isStandaloneDisplay = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia("(display-mode: standalone)").matches;

type View = "loading" | "install" | "login" | "home";

// ─── Minimal home screen shown after login ────────────────────────────────────
// Replace the content inside here as the app grows.
function HomeScreen({
  userProfile,
  onReset,
}: {
  userProfile: UserProfile;
  onReset: () => void;
}) {
  return (
    <div
      className="h-dvh w-screen flex flex-col relative overflow-hidden p-6"
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

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 flex flex-col justify-end max-w-md w-full z-10 pb-6"
      >
        {/* Status badge */}
        <div
          className="inline-flex items-center gap-1.5 text-xs mb-6 self-start"
          style={{
            color: "var(--color-forest)",
            fontFamily: "var(--font-sans-light)",
          }}
        >
          <UnifiedEmoji unified="2705" size={13} />
          <span>التطبيق مثبت ويعمل بجودة كاملة</span>
        </div>

        {/* Welcome card */}
        <div
          className="w-full p-4 rounded-2xl border mb-4"
          style={{
            backgroundColor: "rgba(255,255,255,0.55)",
            borderColor: "rgba(18,30,23,0.08)",
          }}
        >
          <p
            className="text-sm mb-0.5"
            style={{
              fontFamily: "var(--font-sans-light)",
              color: "var(--color-darkest)",
            }}
          >
            مرحباً،{" "}
            <span style={{ fontFamily: "var(--font-sans-medium)" }}>
              {userProfile.name}
            </span>
          </p>
        </div>

        {/* Reset (testing only) */}
        <button
          onClick={onReset}
          className="text-[11px] underline opacity-40 self-start"
          style={{
            fontFamily: "var(--font-sans-light)",
            color: "var(--color-darkest)",
          }}
        >
          إعادة تعيين (للاختبار)
        </button>
      </motion.div>
    </div>
  );
}

// ─── Root Page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [view, setView] = useState<View>("loading");
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const ios = isIOS();
    const standalone = isInStandaloneMode() || isStandaloneDisplay();
    setIsIOSDevice(ios);
    setIsStandalone(standalone);

    let profile: UserProfile | null = null;
    try {
      const raw = localStorage.getItem("user_profile");
      if (raw) profile = JSON.parse(raw);
    } catch (e) {
      console.error("Failed to parse user_profile", e);
    }
    if (profile) setUserProfile(profile);

    setView(standalone ? (profile ? "home" : "login") : "install");

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

  const handleLoginSave = (profile: UserProfile) => {
    setUserProfile(profile);
    setView("home");
    triggerToast(`أهلاً بك يا ${profile.name}`);
  };

  const handleReset = () => {
    localStorage.removeItem("user_profile");
    setUserProfile(null);
    setView("login");
    triggerToast("تم تسجيل الخروج");
  };

  if (view === "loading") return null;

  return (
    <>
      {/* ── Global Toast ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed top-5 left-4 right-4 z-[60] max-w-md mx-auto"
          >
            <div
              className="px-4 py-3 rounded-2xl shadow-xl border flex items-center justify-between gap-3 text-xs backdrop-blur-md"
              style={{
                backgroundColor: "var(--color-darkest)",
                color: "var(--color-cream)",
                borderColor: "rgba(255,255,255,0.12)",
                fontFamily: "var(--font-sans-light)",
              }}
            >
              <div className="flex items-center gap-2">
                <UnifiedEmoji unified="1f514" size={16} />
                <span>{toastMessage}</span>
              </div>
              <button
                onClick={() => setToastMessage(null)}
                className="opacity-50 hover:opacity-100 px-1"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Views ────────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {view === "install" && (
          <motion.div
            key="install"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <InstallView
              isIOSDevice={isIOSDevice}
              isStandalone={isStandalone}
              deferredPrompt={deferredPrompt}
              onInstallAccepted={() => setView("login")}
              triggerToast={triggerToast}
            />
          </motion.div>
        )}

        {view === "login" && (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <LoginView onSave={handleLoginSave} triggerToast={triggerToast} />
          </motion.div>
        )}

        {view === "home" && userProfile && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <HomeScreen userProfile={userProfile} onReset={handleReset} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
