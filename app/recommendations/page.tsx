"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";

const Emoji = dynamic(
  () => import("emoji-picker-react").then((mod) => mod.Emoji),
  { ssr: false },
);

export default function TracksPage() {
  const router = useRouter();

  return (
    <div
      className="min-h-dvh w-screen flex flex-col relative overflow-hidden"
      dir="rtl"
      style={{
        backgroundColor: "var(--color-cream)",
        color: "var(--color-darkest)",
      }}
    >
      {/* Ambient glow */}
      <div
        className="absolute -top-20 left-1/2 -translate-x-1/2 w-[120%] h-48 rounded-full blur-3xl pointer-events-none opacity-15 z-0"
        style={{
          background:
            "radial-gradient(ellipse at top, var(--color-forest) 0%, transparent 75%)",
        }}
      />

      {/* Navigation Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between p-6 z-10"
      >
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.back()}
          className="arabic-stylish p-2 rounded-full text-base"
          style={{
            backgroundColor: "rgba(18,30,23,0.03)",
            border: "1px solid rgba(18,30,23,0.08)",
            color: "var(--color-darkest)",
            fontFamily: "var(--font-sans-light)",
          }}
        >ٍ
          <MdOutlineKeyboardArrowRight />
        </motion.button>

        {/* SVG Title */}
        <motion.img
          src="/titles/Recommandation-Title.svg"
          alt="المسارات المنهجية"
          draggable={false}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          className="h-7"
        />

        <div className="w-10" />
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto z-10"
      >
        <div className="flex gap-1">
          {" "}
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.5,
              ease: [0.34, 1.56, 0.64, 1],
              delay: 0.18,
            }}
            className="flex items-center justify-center"
          >
            <Emoji unified="1f4da" size={24} />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut", delay: 0.25 }}
            className="text-xl mb-2"
            style={{ fontFamily: "var(--font-sans-medium)" }}
          >
            قريباً إن شاء الله
          </motion.h2>
        </div>
        {/* Icon bubble */}

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.32 }}
          className="text-base leading-relaxed max-w-[80%]"
          style={{
            fontFamily: "var(--font-sans-light)",
            opacity: 0.55,
          }}
        >
          نعمل حالياً على تجهيز صغحة ترشيحات البنيان لتكون متاحة لكم في أقرب
          وقت.
        </motion.p>

        {/* Decorative dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="flex gap-2 mt-8"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.2, 0.6, 0.2] }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                delay: i * 0.25,
                ease: "easeInOut",
              }}
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "var(--color-forest)" }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
