"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiLogOut } from "react-icons/fi";
import { RiBookmarkLine } from "react-icons/ri";
import { MdOutlineSettings } from "react-icons/md";
import type { AuthUser } from "@/types/auth";

// ─── Profile Dropdown Modal ───────────────────────────────────────────────────
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

  // Close on outside click
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

        {/* الحساب الشخصي */}
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

        {/* المحفوظات */}
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

        {/* تسجيل الخروج */}
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

// ─── Top Navbar ───────────────────────────────────────────────────────────────
export default function TopNavbar({
  user,
  onLogout,
}: {
  user: AuthUser;
  onLogout: () => void;
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  return (
    <div className="flex items-center justify-between relative z-30 w-full mb-6">
      {/* Logo */}
      <div className="flex-shrink-0">
        <img src="/Logo.svg" alt="Logo" className="w-14 h-14 object-contain" />
      </div>

      {/* Profile Area */}
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
  );
}
