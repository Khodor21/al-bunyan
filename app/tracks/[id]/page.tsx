"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { Emoji } from "emoji-picker-react";
import tracksData from "@/data/tracks.json";

// Type badge config
const TYPE_CONFIG: Record<
  string,
  { label: string; unified: string; color: string }
> = {
  "مقرر مقروء": {
    label: "مقرر مقروء",
    unified: "1f4d6",
    color: "rgba(60,100,70,0.12)",
  },
  "مقرر مسموع": {
    label: "مقرر مسموع",
    unified: "1f3a7",
    color: "rgba(90,60,120,0.10)",
  },
  "مقرر مرئي": {
    label: "مقرر مرئي",
    unified: "1f3ac",
    color: "rgba(160,90,30,0.10)",
  },
};

interface PageProps {
  params: { id: string };
}

export default function TrackDetailPage({ params }: PageProps) {
  const router = useRouter();
  const track = tracksData.tracks.find((t) => t.id === params.id);

  if (!track) {
    return (
      <div
        className="min-h-dvh flex items-center justify-center"
        dir="rtl"
        style={{ backgroundColor: "var(--color-cream)" }}
      >
        <p
          className="text-sm opacity-50"
          style={{ fontFamily: "var(--font-sans-light)" }}
        >
          المسار غير موجود
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-dvh w-screen flex flex-col relative overflow-x-hidden"
      dir="rtl"
      style={{
        backgroundColor: "var(--color-cream)",
        color: "var(--color-darkest)",
      }}
    >
      {/* Ambient glow */}
      <div
        className="absolute -top-20 left-1/2 -translate-x-1/2 w-[120%] h-48 rounded-full blur-3xl pointer-events-none opacity-10 z-0"
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
        <div className="w-10" />
      </motion.div>

      {/* Track Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
        className="flex flex-col items-center px-6 text-center z-10 mb-8"
      >
        {/* Cover image */}
        {track.image && (
          <div className="relative w-[240px] h-[240px] rounded-xl overflow-hidden mb-4 shadow-sm">
            <Image
              src={track.image}
              alt={track.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <h1
          className="text-base leading-snug mb-2 max-w-xs"
          style={{ fontFamily: "var(--font-sans-medium)" }}
        >
          {track.title}
        </h1>

        <p
          className="text-xs leading-relaxed max-w-xs mb-5"
          style={{ fontFamily: "var(--font-sans-light)", opacity: 0.6 }}
        >
          {track.description}
        </p>

        {/* Stats */}
        <div
          className="flex items-center gap-6 text-xs"
          style={{ fontFamily: "var(--font-sans-medium)", opacity: 0.8 }}
        >
          <div>
            <span className="block text-sm font-bold" style={{ opacity: 1 }}>
              {track.مقررات.length}
            </span>
            <span
              style={{ opacity: 0.5, fontFamily: "var(--font-sans-light)" }}
            >
              مقررات
            </span>
          </div>
          <div className="w-px h-3 bg-[rgba(18,30,23,0.15)]" />
          <div>
            <span className="block text-sm font-bold" style={{ opacity: 1 }}>
              {track.duration}
            </span>
            <span
              style={{ opacity: 0.5, fontFamily: "var(--font-sans-light)" }}
            >
              المدة
            </span>
          </div>
        </div>
      </motion.div>

      {/* مقررات List */}
      <div className="flex-1 px-6 pb-12 max-w-md w-full mx-auto z-10">
        <p
          className="text-xs mb-3"
          style={{ fontFamily: "var(--font-sans-medium)" }}
        >
          مقررات المسار
        </p>

        <div className="flex flex-col gap-3">
          {track.مقررات.map((item, idx) => {
            const typeConf = TYPE_CONFIG[item.type] ?? {
              label: item.type,
              unified: "1f4d6",
              color: "rgba(18,30,23,0.08)",
            };

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.07 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  router.push(`/tracks/${track.id}/content/${item.id}`)
                }
                className="flex items-center gap-3 py-3 rounded-2xl cursor-pointer transition-all"
              >
                {/* Thumbnail */}
                <div className="relative w-16 h-16 rounded-base overflow-hidden shrink-0 bg-[rgba(18,30,23,0.05)]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <h3
                    className="text-base leading-snug truncate"
                    style={{ fontFamily: "var(--font-sans-medium)" }}
                  >
                    {item.title}
                  </h3>
                  {/* Description preview */}
                  {"description" in item && item.description && (
                    <p
                      className="text-xs opacity-50 leading-snug line-clamp-2"
                      style={{ fontFamily: "var(--font-sans-light)" }}
                    >
                      {item.description as string}
                    </p>
                  )}
                  {/* Type badge */}
                  <span
                    className="inline-flex items-center gap-1 self-start text-sm"
                    style={{
                      fontFamily: "var(--font-sans-light)",
                      color: "var(--color-darkest)",
                    }}
                  >
                    <Emoji unified={typeConf.unified} size={11} />
                    {typeConf.label}
                  </span>

                  <span
                    className="text-[10px] opacity-40"
                    style={{ fontFamily: "var(--font-sans-light)" }}
                  >
                    {item.duration}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
