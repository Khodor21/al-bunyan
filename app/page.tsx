"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AiOutlineUser } from "react-icons/ai";
import { RiBookmarkLine } from "react-icons/ri";
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

// ─── Hero Slider ─────────────────────────────────────────────────────────────
const HERO_SLIDES = [
  "/hero/Hero-1.svg",
  "/hero/Hero-2.svg",
  "/hero/Hero-3.svg",
];

function HeroSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="relative w-full flex items-center justify-center"
      style={{ height: 80 }}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={HERO_SLIDES[index]}
          src={HERO_SLIDES[index]}
          alt=""
          draggable={false}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="absolute w-full max-w-xs"
        />
      </AnimatePresence>
    </div>
  );
}

// ─── Home screen ─────────────────────────────────────────────────────────────
function HomeScreen() {
  const [showQuotes, setShowQuotes] = useState(false);
  const router = useRouter();

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
        <div className="flex items-center gap-[6px] absolute top-8 left-6 z-20">
          <div className="">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => router.push("/profile")}
              className="w-13 h-13 flex items-center justify-center"
            >
              <AiOutlineUser
                size={22}
                style={{ color: "var(--color-darkest)" }}
              />
            </motion.button>
          </div>
          <div className="">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => router.push("/saved")}
              className="w-13 h-13 flex items-center justify-center"
            >
              <RiBookmarkLine
                size={20}
                style={{ color: "var(--color-darkest)" }}
              />
            </motion.button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto z-10 pb-12 gap-10"
        >
          <div className="flex-1" />

          {/* Hero Slider */}
          <HeroSlider />

          {/* Spacer for dots */}
          <div className="h-2" />

          {/* Main Action Grid */}
          <div className="grid grid-cols-2 gap-2 text-center mx-auto">
            {[
              {
                label: "المسارات المنهجية",
                emoji: "1f9e0",
                action: () => router.push("/tracks"),
              },
              {
                label: "مقالات البنيان",
                emoji: "1f4dd",
                action: () => router.push("/articles"),
              },
              {
                label: "اقتباسات الأئمة الأعلام",
                emoji: "1f4dc",
                action: () => setShowQuotes(true),
              },
              {
                label: "ترشيحات البنيان",
                emoji: "1f3a7",
                action: () => router.push("/recommendations"),
              },
            ].map(({ label, emoji, action }) => (
              <motion.button
                key={label}
                whileTap={{ scale: 0.97 }}
                onClick={action}
                className="arabic-stylish mx-auto text-center w-fit flex items-center justify-center gap-1 px-3 py-2 rounded-full text-sm"
                style={{
                  backgroundColor: "rgba(18,30,23,0.03)",
                  border: "1px solid rgba(18,30,23,0.08)",
                  color: "var(--color-darkest)",
                  fontFamily: "var(--font-sans-light)",
                }}
              >
                <UnifiedEmoji unified={emoji} size={16} />
                {label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

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
