"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiArrowRight, FiBookOpen } from "react-icons/fi";

export default function TracksPage() {
  const router = useRouter();

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
          <FiArrowRight size={20} />
        </button>
        <h1
          className="text-lg font-bold"
          style={{ fontFamily: "var(--font-sans-medium)" }}
        >
          المسارات المنهجية
        </h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto"
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{
            backgroundColor: "rgba(18,30,23,0.04)",
            color: "var(--color-forest)",
          }}
        >
          <FiBookOpen size={32} />
        </div>

        <h2
          className="text-xl mb-2"
          style={{ fontFamily: "var(--font-sans-medium)" }}
        >
          قريباً
        </h2>

        <p
          className="text-sm opacity-60 leading-relaxed max-w-[250px]"
          style={{ fontFamily: "var(--font-sans-light)" }}
        >
          نعمل حالياً على تجهيز المسارات المنهجية لتكون متاحة لك في أقرب وقت.
        </p>
      </motion.div>
    </div>
  );
}
