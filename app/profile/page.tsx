"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiArrowRight, FiUser, FiSettings, FiLogOut } from "react-icons/fi";

export default function ProfilePage() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      // Hard refresh to reset PWA state and trigger login view naturally
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
      <div className="flex items-center justify-between p-6">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 transition-colors"
        >
          {/* RTL Arrow points right to go "back" */}
          <FiArrowRight size={20} />
        </button>
        <h1
          className="text-lg font-bold"
          style={{ fontFamily: "var(--font-sans-medium)" }}
        >
          الملف الشخصي
        </h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 px-6 flex flex-col max-w-md w-full mx-auto gap-8 pt-4"
      >
        {/* Avatar Placeholder */}
        <div className="flex flex-col items-center justify-center gap-4">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center shadow-sm"
            style={{
              backgroundColor: "rgba(18,30,23,0.06)",
              color: "var(--color-forest)",
            }}
          >
            <FiUser size={40} />
          </div>
        </div>

        {/* Action List */}
        <div className="flex flex-col gap-3">
          <button
            className="w-full p-4 rounded-2xl flex items-center gap-4 transition-colors bg-white/50 border shadow-sm"
            style={{ borderColor: "rgba(18,30,23,0.05)" }}
          >
            <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center">
              <FiSettings size={18} />
            </div>
            <span
              className="text-base"
              style={{ fontFamily: "var(--font-sans-medium)" }}
            >
              إعدادات الحساب
            </span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full p-4 rounded-2xl flex items-center gap-4 transition-colors bg-red-500/10 border shadow-sm mt-4"
            style={{ borderColor: "rgba(239,68,68,0.1)", color: "#ef4444" }}
          >
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <FiLogOut size={18} />
            </div>
            <span
              className="text-base"
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
