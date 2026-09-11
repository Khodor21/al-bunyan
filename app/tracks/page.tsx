"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Image from "next/image";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import tracksData from "@/data/tracks.json";

const Emoji = dynamic(
  () => import("emoji-picker-react").then((mod) => mod.Emoji),
  { ssr: false },
);

export default function TracksPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"tracks" | "about">("tracks");

  const { tracks, meta } = tracksData;

  return (
    <div
      className="min-h-dvh w-screen flex flex-col relative overflow-x-hidden"
      dir="rtl"
      style={{
        backgroundColor: "var(--color-cream)",
        color: "var(--color-darkest)",
      }}
    >
      {/* Ambient background glow */}
      <div
        className="absolute -top-20 left-1/2 -translate-x-1/2 w-[120%] h-48 rounded-full blur-3xl pointer-events-none opacity-15 z-0"
        style={{
          background:
            "radial-gradient(ellipse at top, var(--color-forest) 0%, transparent 75%)",
        }}
      />

      {/* Header */}
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
          }}
        >
          <MdOutlineKeyboardArrowRight size={14} />
        </motion.button>

        <motion.img
          src="/titles/Tracks-Title.svg"
          alt="المسارات المنهجيّة"
          draggable={false}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          className="h-7"
        />

        <div className="w-10" />
      </motion.div>

      {/* Stats + Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
        className="flex flex-col items-center px-6 text-center z-10 mb-6"
      >
        {/* Stats row — driven by meta */}
        <div
          className="flex items-center gap-6 text-xs mb-6"
          style={{ fontFamily: "var(--font-sans-medium)", opacity: 0.8 }}
        >
          <div>
            <span className="block text-sm font-bold" style={{ opacity: 1 }}>
              {meta.totalTracks}
            </span>
            <span
              style={{ opacity: 0.5, fontFamily: "var(--font-sans-light)" }}
            >
              مسارات
            </span>
          </div>
          <div className="w-px h-3 bg-[rgba(18,30,23,0.15)]" />
          <div>
            <span className="block text-sm font-bold" style={{ opacity: 1 }}>
              {meta.totalLessons}
            </span>
            <span
              style={{ opacity: 0.5, fontFamily: "var(--font-sans-light)" }}
            >
              درساً
            </span>
          </div>
          <div className="w-px h-3 bg-[rgba(18,30,23,0.15)]" />
          <div>
            <span className="block text-sm font-bold" style={{ opacity: 1 }}>
              {meta.totalHours}
            </span>
            <span
              style={{ opacity: 0.5, fontFamily: "var(--font-sans-light)" }}
            >
              ساعة
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="flex w-full max-w-xs rounded-full p-1 gap-1 mb-2"
          style={{
            backgroundColor: "rgba(18,30,23,0.04)",
            border: "1px solid rgba(18,30,23,0.06)",
          }}
        >
          <button
            onClick={() => setActiveTab("tracks")}
            className="flex-1 py-2 text-xs rounded-full transition-all"
            style={{
              fontFamily: "var(--font-sans-medium)",
              backgroundColor:
                activeTab === "tracks" ? "var(--color-cream)" : "transparent",
              color:
                activeTab === "tracks"
                  ? "var(--color-darkest)"
                  : "rgba(18,30,23,0.5)",
              boxShadow:
                activeTab === "tracks"
                  ? "0 2px 8px rgba(18,30,23,0.06)"
                  : "none",
            }}
          >
            المسارات المتاحة
          </button>
          <button
            onClick={() => setActiveTab("about")}
            className="flex-1 py-2 text-xs rounded-full transition-all"
            style={{
              fontFamily: "var(--font-sans-medium)",
              backgroundColor:
                activeTab === "about" ? "var(--color-cream)" : "transparent",
              color:
                activeTab === "about"
                  ? "var(--color-darkest)"
                  : "rgba(18,30,23,0.5)",
              boxShadow:
                activeTab === "about"
                  ? "0 2px 8px rgba(18,30,23,0.06)"
                  : "none",
            }}
          >
            عن المنصة
          </button>
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 px-6 pb-12 max-w-md w-full mx-auto z-10">
        {activeTab === "tracks" ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-3"
          >
            {tracks.map((track, idx) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.08 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(`/tracks/${track.id}`)}
                className="p-4 rounded-2xl cursor-pointer flex flex-col gap-2 transition-all"
                style={{
                  backgroundColor: "rgba(18,30,23,0.03)",
                  border: "1px solid rgba(18,30,23,0.08)",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {/* Track image if available, fallback to emoji */}
                    {track.image ? (
                      <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 relative">
                        <Image
                          src={track.image}
                          alt={track.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: "rgba(18,30,23,0.06)" }}
                      >
                        <Emoji unified={track.emoji} size={18} />
                      </div>
                    )}
                    <h3
                      className="text-sm font-medium leading-snug"
                      style={{ fontFamily: "var(--font-sans-medium)" }}
                    >
                      {track.shortTitle ?? track.title}
                    </h3>
                  </div>
                  <MdOutlineKeyboardArrowRight
                    size={18}
                    className="rotate-180 opacity-40 shrink-0 mt-1"
                  />
                </div>

                <p
                  className="text-xs leading-relaxed line-clamp-2 pr-1"
                  style={{
                    fontFamily: "var(--font-sans-light)",
                    opacity: 0.6,
                  }}
                >
                  {track.description}
                </p>

                <div
                  className="flex items-center gap-4 pt-2 mt-1 text-[11px]"
                  style={{
                    fontFamily: "var(--font-sans-light)",
                    opacity: 0.5,
                    borderTop: "1px solid rgba(18,30,23,0.04)",
                  }}
                >
                  <span>{track.duration}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-5 rounded-2xl text-center flex flex-col gap-3"
            style={{
              backgroundColor: "rgba(18,30,23,0.03)",
              border: "1px solid rgba(18,30,23,0.08)",
            }}
          >
            <h4
              className="text-sm font-medium"
              style={{ fontFamily: "var(--font-sans-medium)" }}
            >
              مفهوم المسارات المنهجية
            </h4>
            <p
              className="text-xs leading-relaxed"
              style={{
                fontFamily: "var(--font-sans-light)",
                opacity: 0.65,
              }}
            >
              تم تصميم هذه المسارات لترتيب أولوية طلب العلم الشرعي والتأصيل
              المعرفي، بحيث ينتقل طالب العلم تدريجياً من المتون المختصرة إلى
              المطولات وفق خطط محكمة بإشراف أهل الاختصاص.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
