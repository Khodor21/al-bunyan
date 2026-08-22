"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import type { AuthUser } from "@/types/auth";

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
// Replace the body of this component with your actual app content.
function HomeScreen({
  user,
  onLogout,
}: {
  user: AuthUser;
  onLogout: () => void;
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
        {/* Installed badge */}
        <div
          className="inline-flex items-center gap-1.5 text-xs mb-5 self-start"
          style={{
            color: "var(--color-forest)",
            fontFamily: "var(--font-sans-light)",
          }}
        >
          <UnifiedEmoji unified="2705" size={13} />
          <span>التطبيق مثبت ويعمل بجودة كاملة</span>
        </div>

        {/* User card */}
        <div
          className="w-full p-4 rounded-2xl border mb-4 flex items-center justify-between"
          style={{
            backgroundColor: "rgba(255,255,255,0.55)",
            borderColor: "rgba(18,30,23,0.08)",
          }}
        >
          <div>
            <p
              className="text-sm"
              style={{
                fontFamily: "var(--font-sans-light)",
                color: "var(--color-darkest)",
              }}
            >
              مرحباً،{" "}
              <span style={{ fontFamily: "var(--font-sans-medium)" }}>
                {user.name}
              </span>
            </p>
            <p
              className="text-[11px] mt-0.5 opacity-50"
              style={{
                fontFamily: "var(--font-sans-light)",
                color: "var(--color-darkest)",
              }}
            >
              {user.location} · {user.role}
            </p>
          </div>

          {/* Role badge */}
          <span
            className="text-[10px] px-2 py-0.5 rounded-full border"
            style={{
              borderColor: "rgba(90,101,59,0.2)",
              backgroundColor: "rgba(90,101,59,0.06)",
              color: "var(--color-forest)",
              fontFamily: "var(--font-sans-light)",
            }}
          >
            {user.role === "admin"
              ? "مشرف"
              : user.role === "publisher"
                ? "ناشر"
                : "مستخدم"}
          </span>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="text-[11px] underline opacity-35 self-start"
          style={{
            fontFamily: "var(--font-sans-light)",
            color: "var(--color-darkest)",
          }}
        >
          تسجيل الخروج
        </button>
      </motion.div>
    </div>
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

    // Non-standalone browsers always see install view — no auth check needed
    if (!standalone) {
      setView("install");
      return;
    }

    // Standalone: check session cookie via server
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
        // Network error — show login rather than crashing
        setView("login");
      }
    };

    checkSession();

    // Capture Android/Chrome beforeinstallprompt
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

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setUser(null);
      setView("login");
      triggerToast("تم تسجيل الخروج");
    }
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
                onClick={() => setToast(null)}
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
              onInstallAccepted={() => {
                /* PWA will relaunch standalone */
              }}
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
            <HomeScreen user={user} onLogout={handleLogout} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
