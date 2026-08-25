"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiUser, FiSettings, FiLogOut } from "react-icons/fi";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import type { AuthUser } from "@/types/auth";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setUser(data.user))
      .catch(console.error);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      window.location.href = "/";
    }
  };

  return (
    <div
      className="min-h-dvh w-screen flex flex-col relative"
      dir="rtl"
      style={{
        backgroundColor: "var(--color-cream)",
        color: "var(--color-darkest)",
      }}
    >
      {/* Navigation Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between py-6 px-4 z-10 w-full"
      >
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.back()}
          className="p-2 rounded-full text-base"
          style={{
            backgroundColor: "rgba(18,30,23,0.03)",
            border: "1px solid rgba(18,30,23,0.08)",
            color: "var(--color-darkest)",
            fontFamily: "var(--font-sans-light)",
          }}
        >
          <MdOutlineKeyboardArrowRight size={14} />
        </motion.button>

        <motion.img
          src="/titles/Profile-Title.svg"
          alt="الملف الشخصي"
          draggable={false}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          className="h-7"
        />

        <div className="w-10" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 px-6 flex flex-col max-w-md w-full mx-auto gap-8 pt-4"
      >
        {/* Avatar + User Info */}
        <div className="flex flex-col items-center justify-center gap-3">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center shadow-sm"
            style={{
              backgroundColor: "rgba(18,30,23,0.06)",
              color: "var(--color-forest)",
            }}
          >
            <FiUser size={40} />
          </div>

          {user ? (
            <>
              <p
                className="text-lg"
                style={{ fontFamily: "var(--font-sans-medium)" }}
              >
                {user.name}
              </p>
              <p
                className="text-sm opacity-50"
                style={{ fontFamily: "var(--font-sans-light)" }}
              >
                {user.countryCode} {user.phone}
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 mt-1">
              <div className="h-5 w-32 rounded-full bg-black/5 animate-pulse" />
              <div className="h-4 w-24 rounded-full bg-black/5 animate-pulse" />
            </div>
          )}
        </div>

        {/* Action List */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleLogout}
            className="w-full px-3 py-3 rounded flex items-center gap-2 transition-colors bg-red-500/10 border shadow-sm mt-4"
            style={{ borderColor: "rgba(239,68,68,0.1)", color: "#ef4444" }}
          >
            <FiLogOut size={16} />
            <span
              className="text-sm"
              style={{ fontFamily: "var(--font-sans-medium)" }}
            >
              تسجيل الخروج
            </span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
