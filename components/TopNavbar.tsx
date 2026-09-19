"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiLogOut } from "react-icons/fi";
import { RiBookmarkLine } from "react-icons/ri";
import { MdOutlineSettings } from "react-icons/md";
import type { AuthUser } from "@/types/auth";

const AI_ONBOARDING_KEY = "baniyan_ai_onboarding_seen";

// ─── Profile Dropdown ─────────────────────────────────────────────────────────
function ProfileDropdown({
  user,
  onClose,
  onLogout,
  onGoProfile,
  onGoSaved,
}: {
  user: AuthUser | null;
  onClose: () => void;
  onLogout: () => void;
  onGoProfile: () => void;
  onGoSaved: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: -8 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="absolute top-12 left-0 z-50 w-52 origin-top-left"
      dir="rtl"
      ref={ref}
    >
      <div
        className="rounded-2xl overflow-hidden shadow-sm"
        style={{
          backgroundColor: "var(--color-cream)",
          border: "1px solid rgba(18,30,23,0.08)",
        }}
      >
        {/* User row */}
        <div
          className="flex items-center gap-2 px-4 py-3.5"
          style={{ borderBottom: "1px solid rgba(18,30,23,0.06)" }}
        >
          <img
            src="/Profile User.svg"
            alt=""
            className="w-7 h-7 rounded-full object-cover flex-shrink-0 bg-black/5"
          />
          <span
            className="text-sm truncate"
            style={{
              fontFamily: "var(--font-sans-medium)",
              color: "var(--color-darkest)",
            }}
          >
            {user?.name ?? "..."}
          </span>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            onClose();
            onGoProfile();
          }}
          className="w-full flex items-center gap-2 px-4 py-3.5 text-xs text-right transition-colors hover:bg-black/5"
          style={{
            fontFamily: "var(--font-sans-light)",
            color: "var(--color-darkest)",
            borderBottom: "1px solid rgba(18,30,23,0.06)",
            background: "transparent",
          }}
        >
          <MdOutlineSettings
            size={16}
            style={{ opacity: 0.6, flexShrink: 0 }}
          />
          <span>الحساب الشخصي</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            onClose();
            onGoSaved();
          }}
          className="w-full flex items-center gap-2 px-4 py-3.5 text-xs text-right transition-colors hover:bg-black/5"
          style={{
            fontFamily: "var(--font-sans-light)",
            color: "var(--color-darkest)",
            borderBottom: "1px solid rgba(18,30,23,0.06)",
            background: "transparent",
          }}
        >
          <RiBookmarkLine size={16} style={{ opacity: 0.6, flexShrink: 0 }} />
          <span>المحفوظات</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            onClose();
            onLogout();
          }}
          className="w-full flex items-center gap-2 px-4 py-3.5 text-xs text-right transition-colors hover:bg-red-50"
          style={{
            fontFamily: "var(--font-sans-light)",
            color: "#ef4444",
            background: "transparent",
          }}
        >
          <FiLogOut size={16} style={{ flexShrink: 0 }} />
          <span>تسجيل الخروج</span>
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── AI Onboarding Modal ──────────────────────────────────────────────────────
function AIOnboardingModal({ onClose }: { onClose: () => void }) {
  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[100] flex items-end justify-center pb-10 px-5"
        style={{
          backgroundColor: "rgba(18,30,23,0.35)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
      >
        {/* Card */}
        <motion.div
          key="card"
          initial={{ opacity: 0, y: 32, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm rounded-3xl overflow-hidden"
          dir="rtl"
          style={{
            backgroundColor: "var(--color-cream)",
            border: "1px solid rgba(18,30,23,0.08)",
          }}
        >
          {/* Icon area */}
          <div
            className="flex items-center justify-center pt-8 pb-4"
            style={{ background: "rgba(18,30,23,0.03)" }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{
                backgroundColor: "var(--color-forest)",
                boxShadow: "0 4px 20px rgba(18,30,23,0.2)",
              }}
            >
              🤖
            </div>
          </div>

          {/* Text */}
          <div className="px-6 pt-4 pb-2 text-center">
            <p
              className="text-base mb-2"
              style={{
                fontFamily: "var(--font-sans-medium)",
                color: "var(--color-darkest)",
              }}
            >
              مساعد البنيان الذكي
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{
                fontFamily: "var(--font-sans-light)",
                color: "rgba(18,30,23,0.65)",
              }}
            >
              اسأل عن أي حدث أو شخصية في التاريخ الإسلامي المعاصر، وسيجيبك
              المساعد بناءً على محتوى المنصة.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 px-6 py-5">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onClose}
              className="w-full py-3 rounded-2xl text-sm text-center"
              style={{
                backgroundColor: "var(--color-forest)",
                color: "var(--color-cream)",
                fontFamily: "var(--font-sans-medium)",
              }}
            >
              فهمت، لنبدأ
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onClose}
              className="w-full py-2.5 rounded-2xl text-xs text-center"
              style={{
                color: "rgba(18,30,23,0.45)",
                fontFamily: "var(--font-sans-light)",
                background: "transparent",
              }}
            >
              إغلاق
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Top Navbar ───────────────────────────────────────────────────────────────
export default function TopNavbar({
  user,
  onLogout,
}: {
  user: AuthUser;
  onLogout: () => void;
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const router = useRouter();

  // Show onboarding modal once on first visit
  useEffect(() => {
    const seen = localStorage.getItem(AI_ONBOARDING_KEY);
    if (!seen) {
      // Small delay so the page settles first
      const t = setTimeout(() => setShowAIModal(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const handleCloseAIModal = () => {
    setShowAIModal(false);
    localStorage.setItem(AI_ONBOARDING_KEY, "1");
  };

  const handleAIButtonClick = () => {
    router.push("/ai");
  };

  return (
    <>
      {/* ── Navbar ── */}
      {/*
        z-index hierarchy:
          navbar wrapper  → z-30
          dropdown        → z-50  (portal would be ideal but this works
                                   as long as no sibling has a higher stacking context)
        The dropdown is positioned relative to `.relative` on the profile button wrapper,
        so it naturally layers above the page content below the navbar.
      */}
      <div className="flex items-center justify-between relative z-30 w-full mb-6">
        {/* Logo — left in RTL layout */}
        <div className="flex-shrink-0">
          <a href="/">
            <img
              src="/Logo.svg"
              alt="Logo"
              className="w-14 h-14 object-contain"
            />
          </a>
        </div>

        {/* Right cluster: AI button + profile */}
        <div className="flex items-center gap-2.5">
          {/* AI Button */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleAIButtonClick}
            className="flex items-center justify-center w-9 h-9 rounded-full text-base"
            style={{
              backgroundColor: "var(--color-forest)",
              color: "var(--color-cream)",
              boxShadow: "0 2px 10px rgba(18,30,23,0.18)",
            }}
            aria-label="مساعد الذكاء الاصطناعي"
          >
            🤖
          </motion.button>

          {/* Profile */}
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setShowDropdown((v) => !v)}
              className="flex items-center justify-center rounded-full"
            >
              <img
                alt="Profile Image"
                src="/Profile User.svg"
                className="w-8 h-8 rounded-full object-cover"
              />
            </motion.button>

            <AnimatePresence>
              {showDropdown && (
                <ProfileDropdown
                  user={user}
                  onClose={() => setShowDropdown(false)}
                  onLogout={onLogout}
                  onGoProfile={() => router.push("/profile")}
                  onGoSaved={() => router.push("/saved")}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── AI Onboarding Modal ── rendered outside navbar flow */}
      {showAIModal && <AIOnboardingModal onClose={handleCloseAIModal} />}
    </>
  );
}
