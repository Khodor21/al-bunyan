"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { MdBookmark, MdBookmarkBorder } from "react-icons/md";

// ── Types ────────────────────────────────────────────────────────────────────

interface Article {
  id: string;
  title: string;
  source: string;
  readTime: string;
  coverImage: string;
  url: string;
}

// ── Mock Data (4 articles for UI testing) ───────────────────────────────────

const ARTICLES: Article[] = [
  {
    id: "1",
    title: "كافكا والفلسفة: البحث عن الحرية وسط عبثية العالم",
    source: "مقالات البنيان",
    readTime: "٢ دقيقة",
    coverImage:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80",
    url: "#",
  },
  {
    id: "2",
    title: "وهم النضج، حين يختبئ الجهل في ثوب الحكمة",
    source: "مقالات البنيان",
    readTime: "١ دقيقة",
    coverImage:
      "https://images.unsplash.com/photo-1447069387593-a5de0862481e?w=400&q=80",
    url: "#",
  },
  {
    id: "3",
    title: "تاريخ العبيد والعبودية عبر الحضارات",
    source: "تاريخ وسياسة",
    readTime: "١٥ دقيقة",
    coverImage:
      "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&q=80",
    url: "#",
  },
  {
    id: "4",
    title: "العلوم التي سرقها الغرب من المسلمين: التاريخ المنسي",
    source: "هدوء",
    readTime: "٣ دقائق",
    coverImage:
      "https://images.unsplash.com/photo-1546514714-df0ccc50d7bf?w=400&q=80",
    url: "#",
  },
];

const STORAGE_KEY = "blogs_saved_articles";

// ── Toast Notification ───────────────────────────────────────────────────────

function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.96 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm shadow-lg backdrop-blur-md whitespace-nowrap"
          style={{
            backgroundColor: "rgba(18,30,23,0.88)",
            color: "var(--color-cream)",
            fontFamily: "var(--font-sans-medium)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          dir="rtl"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Article Card ─────────────────────────────────────────────────────────────

function ArticleCard({
  article,
  index,
  saved,
  onToggleSave,
}: {
  article: Article;
  index: number;
  saved: boolean;
  onToggleSave: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        ease: [0.16, 1, 0.3, 1],
        delay: 0.12 + index * 0.07,
      }}
      className="relative rounded-2xl overflow-hidden cursor-pointer"
      style={{ aspectRatio: "3/4" }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Cover image */}
      <img
        src={article.coverImage}
        alt={article.title}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* Gradient overlay — dark at bottom */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(10,14,10,0.92) 0%, rgba(10,14,10,0.45) 45%, rgba(10,14,10,0.10) 70%, transparent 100%)",
        }}
      />

      {/* Bookmark button */}
      <motion.button
        whileTap={{ scale: 0.88 }}
        onClick={(e) => {
          e.stopPropagation();
          onToggleSave(article.id);
        }}
        className="absolute top-3 right-3 p-1.5 rounded-full z-10"
        style={{
          backgroundColor: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(6px)",
          border: "1px solid rgba(255,255,255,0.14)",
          color: saved ? "var(--color-forest)" : "rgba(255,255,255,0.85)",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={saved ? "saved" : "unsaved"}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="flex"
          >
            {saved ? <MdBookmark size={16} /> : <MdBookmarkBorder size={16} />}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      {/* Text content */}
      <div className="absolute inset-x-0 bottom-0 p-3.5 flex flex-col gap-1.5">
        {/* Source */}
        <span
          className="text-[10px] opacity-60 leading-none"
          style={{
            color: "rgba(255,255,255,0.85)",
            fontFamily: "var(--font-sans-light)",
          }}
        >
          {article.source}
        </span>

        {/* Title */}
        <h3
          className="text-sm leading-snug font-medium"
          style={{
            color: "#fff",
            fontFamily: "var(--font-sans-medium)",
          }}
        >
          {article.title}
        </h3>

        {/* Read time row */}
        <div className="flex items-center gap-1.5 mt-0.5">
          <div className="w-4 h-4 rounded-full bg-white/20" />
          <span
            className="text-[10px] opacity-55"
            style={{
              color: "#fff",
              fontFamily: "var(--font-sans-light)",
            }}
          >
            {article.readTime} قراءة
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function BlogsPage() {
  const router = useRouter();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: "",
    visible: false,
  });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load saved from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSavedIds(new Set(JSON.parse(raw)));
    } catch {}
  }, []);

  const showToast = (message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, visible: true });
    toastTimer.current = setTimeout(
      () => setToast((t) => ({ ...t, visible: false })),
      2200,
    );
  };

  const handleToggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showToast("تمت إزالة المقال من المحفوظات");
      } else {
        next.add(id);
        showToast("تم حفظ المقال ✓");
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {}
      return next;
    });
  };

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
        >
          <MdOutlineKeyboardArrowRight />
        </motion.button>

        <motion.img
          src="/titles/Blogs-Title.svg"
          alt="مقالات البنيان"
          draggable={false}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          className="h-7"
        />

        <div className="w-10" />
      </motion.div>

      {/* 2-column grid */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="flex-1 px-4 pb-8 z-10"
      >
        <div className="grid grid-cols-2 gap-3">
          {ARTICLES.map((article, index) => (
            <ArticleCard
              key={article.id}
              article={article}
              index={index}
              saved={savedIds.has(article.id)}
              onToggleSave={handleToggleSave}
            />
          ))}
        </div>
      </motion.div>

      {/* Toast */}
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}
