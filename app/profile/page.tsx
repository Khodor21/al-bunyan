"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiLogOut } from "react-icons/fi";
import { RiBookmarkFill, RiBookmarkLine } from "react-icons/ri";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { HiOutlineBookOpen } from "react-icons/hi2";
import dynamic from "next/dynamic";
import type { AuthUser } from "@/types/auth";

const Emoji = dynamic(
  () => import("emoji-picker-react").then((mod) => mod.Emoji),
  { ssr: false },
);

// ── Saved articles types & storage key (must match BlogsPage) ─────────────────
const STORAGE_KEY = "ss_saved_articles";

interface Article {
  id: string;
  title: string;
  category: string;
  readTime: string;
  coverImage: string;
  url: string;
  country: string;
}

// Full article list — keep in sync with BlogsPage ARTICLES array
const ALL_ARTICLES: Article[] = [
  {
    id: "1",
    title: "مذبحة قلعة جانغي: عندما تُباد لقولك لا إله إلا الله",
    category: "بيان سبيل المجرمين",
    readTime: "٢ دقيقة",
    coverImage: "/blogs/Blog-1.jpg",
    url: "#",
    country: "1f1e6-1f1eb",
  },
  {
    id: "2",
    title: "جنرال الدمار: كيف قاد ملاديتش حرب الإبادة ضد مسلمي البوسنة؟",
    category: "بيان سبيل المجرمين",
    readTime: "١ دقيقة",
    coverImage: "/blogs/Blog-2.jpg",
    url: "#",
    country: "1f1e7-1f1e6",
  },
  {
    id: "3",
    title: "تاريخ العبيد والعبودية عبر الحضارات",
    category: "بيان سبيل المجرمين",
    readTime: "١٥ دقيقة",
    coverImage: "/blogs/Blog-1.jpg",
    url: "#",
    country: "1f1f5-1f1f8",
  },
  {
    id: "4",
    title: "العلوم التي سرقها الغرب من المسلمين: التاريخ المنسي",
    category: "بيان سبيل المجرمين",
    readTime: "٣ دقائق",
    coverImage: "/blogs/Blog-1.jpg",
    url: "#",
    country: "1f1f8-1f1fe",
  },
];

// ── Saved Article Card ────────────────────────────────────────────────────────
function SavedCard({
  article,
  index,
  onUnsave,
}: {
  article: Article;
  index: number;
  onUnsave: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        duration: 0.35,
        ease: [0.16, 1, 0.3, 1],
        delay: index * 0.05,
      }}
      className="relative w-full cursor-pointer overflow-hidden flex-shrink-0"
      style={{ borderRadius: "16px", aspectRatio: "9/11" }}
    >
      {/* Background image */}
      <img
        src={article.coverImage}
        alt={article.title}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.15) 30%, rgba(0,0,0,0.72) 70%, rgba(0,0,0,0.88) 100%)",
        }}
      />

      {/* Flag badge */}
      <div
        className="absolute top-2.5 right-2.5 flex items-center justify-center z-10"
        style={{
          backgroundColor: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "8px",
          padding: "4px 6px",
        }}
      >
        <Emoji unified={article.country} size={13} />
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col gap-2.5 p-2.5">
        <p
          className="text-xs leading-snug"
          style={{
            color: "#ffffff",
            fontFamily: "var(--font-sans-medium)",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textShadow: "0 1px 4px rgba(0,0,0,0.4)",
          }}
        >
          {article.title}
        </p>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          {/* Unsave button */}
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={(e) => {
              e.stopPropagation();
              onUnsave(article.id);
            }}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-full text-[10px]"
            style={{
              fontFamily: "var(--font-sans-medium)",
              backgroundColor: "var(--color-forest)",
              border: "1px solid var(--color-forest)",
              color: "#ffffff",
            }}
          >
            <RiBookmarkFill size={11} />
            <span>محفوظ</span>
          </motion.button>

          {/* Read button */}
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-full text-[10px]"
            style={{
              fontFamily: "var(--font-sans-medium)",
              backgroundColor: "var(--color-darkest)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "var(--color-cream)",
            }}
          >
            <HiOutlineBookOpen size={11} />
            <span>اقرأ</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Profile Page ─────────────────────────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setUser(data.user))
      .catch(console.error);

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSavedIds(new Set(JSON.parse(raw) as string[]));
    } catch {}
  }, []);

  const handleUnsave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

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

  const savedArticles = ALL_ARTICLES.filter((a) => savedIds.has(a.id));

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
        className="flex-1 px-4 flex flex-col max-w-md w-full mx-auto gap-8 pt-2 pb-14"
      >
        {/* Avatar + User Info */}
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-sm">
            <img
              src="/Profile User.svg"
              alt="profile user"
              className="rounded-full"
            />
          </div>

          {user ? (
            <>
              <p
                className="text-base"
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
            <div className="flex flex-col items-center gap-2">
              <div className="h-5 w-32 rounded-full bg-black/5 animate-pulse" />
              <div className="h-4 w-24 rounded-full bg-black/5 animate-pulse" />
            </div>
          )}
        </div>

        {/* ── Saved Articles ── */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-0.5">
            <span
              className="text-sm opacity-60"
              style={{
                fontFamily: "var(--font-sans-medium)",
                color: "var(--color-darkest)",
              }}
            >
              المحفوظات
            </span>
            <span
              className="text-[11px] opacity-40"
              style={{
                fontFamily: "var(--font-sans-light)",
                color: "var(--color-darkest)",
              }}
            >
              {savedArticles.length} مقالات
            </span>
          </div>

          {savedArticles.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center gap-2 py-10 rounded-2xl"
              style={{
                backgroundColor: "rgba(18,30,23,0.03)",
                border: "1px solid rgba(18,30,23,0.06)",
              }}
            >
              <RiBookmarkLine
                size={28}
                style={{ opacity: 0.25, color: "var(--color-darkest)" }}
              />
              <p
                className="text-sm opacity-40"
                style={{
                  fontFamily: "var(--font-sans-light)",
                  color: "var(--color-darkest)",
                }}
              >
                لا توجد مقالات محفوظة
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <AnimatePresence mode="popLayout">
                {savedArticles.map((article, index) => (
                  <SavedCard
                    key={article.id}
                    article={article}
                    index={index}
                    onUnsave={handleUnsave}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
