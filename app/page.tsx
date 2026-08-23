"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiBookOpen } from "react-icons/fi";
import { RiDoubleQuotesL } from "react-icons/ri"; // Using react-icons
import type { AuthUser } from "@/types/auth";
import QuotesView from "./components/QuotesView";

const UnifiedEmoji = dynamic(
  () => import("emoji-picker-react").then((mod) => mod.Emoji),
  { ssr: false },
);

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

// ─── Home screen ─────────────────────────────────────────────────────────────
function HomeScreen() {
  const [showQuotes, setShowQuotes] = useState(false);
  const router = useRouter();

  // Glassmorphism styling for the main cards
  const glassCardStyle: React.CSSProperties = {
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.25) 100%)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.6)",
    boxShadow: "0 8px 32px rgba(18,30,23,0.05)",
    color: "var(--color-darkest)",
  };

  return (
    <>
      <div
        className="h-dvh w-screen flex flex-col relative overflow-hidden p-6"
        dir="rtl"
        style={{
          backgroundColor: "var(--color-cream)",
          color: "var(--color-darkest)",
        }}
      >
        {/* Ambient background glow */}
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-[120%] h-48 rounded-full blur-3xl pointer-events-none opacity-20 z-0"
          style={{
            background:
              "radial-gradient(ellipse at top, var(--color-forest) 0%, transparent 75%)",
          }}
        />

        {/* Top Navigation Bar */}
        <div className="absolute top-6 left-6 z-20">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => router.push("/profile")}
            className="w-11 h-11 rounded-full flex items-center justify-center transition-colors hover:bg-white/40 shadow-sm"
            style={{
              background: "rgba(255,255,255,0.5)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.6)",
            }}
          >
            <FiUser size={20} style={{ color: "var(--color-darkest)" }} />
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto z-10 pb-12 gap-5"
        >
          {/* Logo / Header could go here in the future. For now, pushing content to middle-bottom */}
          <div className="flex-1" />

          {/* Main Action Grid */}
          <div className="flex flex-row-reverse items-center justify-center text-center gap-4">
            {/* Quotes Button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowQuotes(true)}
              className="w-fit px-4 py-3 rounded-full transition-all relative overflow-hidden group text-right"
              style={{
                backgroundColor: "rgba(18,30,23,0.03)",
                borderColor: "rgba(18,30,23,0.06)",
                color: "var(--color-darkest)",
                fontFamily: "var(--font-sans-medium)",
              }}
            >
              <div className="flex flex-col">
                <span
                  className="text-sm text-center"
                  style={{ fontFamily: "var(--font-sans-light)" }}
                >
                  اقتباسات الأئمة الأعلام
                </span>
              </div>
            </motion.button>

            {/* Methodological Tracks Button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/tracks")}
              className="w-fit px-4 py-3 rounded-full transition-all relative overflow-hidden group"
              style={{
                backgroundColor: "rgba(18,30,23,0.03)",
                borderColor: "rgba(18,30,23,0.06)",
                color: "var(--color-darkest)",
                fontFamily: "var(--font-sans-medium)",
              }}
            >
              <span
                className="text-sm text-center"
                style={{ fontFamily: "var(--font-sans-light)" }}
              >
                المسارات المنهجية
              </span>
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* ── Fullscreen Quotes View Overlay ─────────────────────────────────── */}
      <AnimatePresence>
        {showQuotes && <QuotesView onClose={() => setShowQuotes(false)} />}
      </AnimatePresence>
    </>
  );
}

// ─── Root page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [view, setView] = useState<View>("loading");
  const [isIOSDevice, setIsIOS] = useState(false);
  const [isStandalone, setStandalone] = useState(false);
  const [deferredPrompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [user, setUser] = useState<AuthUser | null>(null);
  const [toastMessage, setToast] = useState<string | null>(null);

  useEffect(() => {
    const ios = isIOS();
    const standalone = isInStandaloneMode() || isStandaloneDisplay();
    setIsIOS(ios);
    setStandalone(standalone);

    if (!standalone) {
      setView("install");
      return;
    }

    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.ok) {
          const { user: u } = await res.json();
          setUser(u);
          setView("home");
        } else {
          setView("login");
        }
      } catch {
        setView("login");
      }
    };

    checkSession();

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleLoginSave = (u: AuthUser) => {
    setUser(u);
    setView("home");
    triggerToast(`أهلاً بك يا ${u.name}`);
  };

  if (view === "loading") return null;

  return (
    <>
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
                onClick={() => setToast(null)}
                className="opacity-50 hover:opacity-100 px-1"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              onInstallAccepted={() => {}}
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

        {view === "home" && user && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <HomeScreen />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
