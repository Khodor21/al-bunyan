"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { RiBookmarkLine, RiBookmarkFill } from "react-icons/ri";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Article {
  id: string;
  title: string;
  source: string;
  sourceInitial: string;
  readTime: string;
  coverImage: string;
  url: string;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const ARTICLES: Article[] = [
  {
    id: "1",
    title: "كافكا والفلسفة: البحث عن الحرية وسط عبثية العالم",
    source: "مقالات البنيان",
    sourceInitial: "ب",
    readTime: "٢ دقيقة",
    coverImage: "/blogs/Blog-1.jpg",
    url: "#",
  },
  {
    id: "2",
    title: "وهم النضج، حين يختبئ الجهل في ثوب الحكمة",
    source: "مقالات البنيان",
    sourceInitial: "ب",
    readTime: "١ دقيقة",
    coverImage: "/blogs/Blog-1.jpg",
    url: "#",
  },
  {
    id: "3",
    title: "تاريخ العبيد والعبودية عبر الحضارات",
    source: "تاريخ وسياسة",
    sourceInitial: "ت",
    readTime: "١٥ دقيقة",
    coverImage: "/blogs/Blog-1.jpg",
    url: "#",
  },
  {
    id: "4",
    title: "العلوم التي سرقها الغرب من المسلمين: التاريخ المنسي",
    source: "هدوء",
    sourceInitial: "هـ",
    readTime: "٣ دقائق",
    coverImage: "/blogs/Blog-1.jpg",
    url: "#",
  },
];

const FILTERS = ["الكل", "بيان سبيل المجرمين", "مقاومة التفاهة", "تصحيح المعايير", "أدب"];
const STORAGE_KEY = "ss_saved_articles";

// ── Toast ─────────────────────────────────────────────────────────────────────

function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="fixed z-50 whitespace-nowrap text-xs px-5 py-2.5 rounded-full shadow-lg"
          style={{
            bottom: "88px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "var(--color-darkest)",
            color: "var(--color-cream)",
            fontFamily: "var(--font-sans-medium)",
          }}
          dir="rtl"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Article Card ──────────────────────────────────────────────────────────────

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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1],
        delay: 0.08 + index * 0.06,
      }}
      whileTap={{ scale: 0.97 }}
      className="rounded-2xl overflow-hidden cursor-pointer flex flex-col relative z-10"
      style={{
        backgroundColor: "var(--color-cream)",
        border: "1px solid rgba(18,30,23,0.08)",
      }}
    >
      {/* Cover image */}
      <img
        src={article.coverImage}
        alt={article.title}
        className="w-full object-cover flex-shrink-0"
        style={{ aspectRatio: "4/3" }}
        draggable={false}
      />

      {/* Card body */}
      <div className="flex flex-col gap-1.5 flex-1 p-2.5 pb-3">
        {/* Source row */}
        <div className="flex items-center gap-1.5">
          {/* Avatar */}
          <div
            className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-[8px] font-bold"
            style={{
              backgroundColor: "rgba(90, 101, 59, 0.12)",
              color: "var(--color-forest)",
              border: "1px solid rgba(90, 101, 59, 0.18)",
            }}
          >
            {article.sourceInitial}
          </div>
          <span
            className="text-[10px] truncate opacity-60"
            style={{ color: "var(--color-darkest)", fontFamily: "var(--font-sans-light)" }}
          >
            {article.source}
          </span>
        </div>

        {/* Title */}
        <p
          className="text-sm mt-0.5"
          style={{
            color: "var(--color-darkest)",
            fontFamily: "var(--font-sans-light)",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {article.title}
        </p>

        {/* Meta row */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <span
            className="text-[10px] opacity-60"
            style={{ color: "var(--color-darkest)", fontFamily: "var(--font-sans-light)" }}
          >
            {article.readTime} قراءة
          </span>

          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(article.id);
            }}
            className="flex items-center justify-center rounded-full p-0.5"
            style={{ background: "transparent", border: "none" }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={saved ? "saved" : "unsaved"}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex"
                style={{ color: saved ? "var(--color-forest)" : "rgba(21, 23, 13, 0.3)" }}
              >
                {saved ? <RiBookmarkFill size={15} /> : <RiBookmarkLine size={15} />}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function BlogsPage() {
  const router = useRouter();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState(0);
  const [toast, setToast] = useState({ message: "", visible: false });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSavedIds(new Set(JSON.parse(raw) as string[]));
    } catch {}
  }, []);

  const showToast = (message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, visible: true });
    toastTimer.current = setTimeout(
      () => setToast((t) => ({ ...t, visible: false })),
      2200
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
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  return (
    <div
      className="min-h-dvh w-screen overflow-x-hidden flex flex-col relative"
      dir="rtl"
      style={{ backgroundColor: "var(--color-cream)", color: "var(--color-darkest)" }}
    >
      {/* Ambient glow matching TracksPage */}
      <div
        className="absolute -top-20 left-1/2 -translate-x-1/2 w-[120%] h-48 rounded-full blur-3xl pointer-events-none opacity-15 z-0"
        style={{
          background:
            "radial-gradient(ellipse at top, var(--color-forest) 0%, transparent 75%)",
        }}
      />

      {/* ── Nav ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between p-6 z-10 w-full"
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

      {/* ── Filter Pills ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="flex gap-2 px-5 py-3 overflow-x-auto relative z-10"
        style={{ scrollbarWidth: "none" }}
      >
        {FILTERS.map((f, i) => (
          <motion.button
            key={f}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveFilter(i)}
            className="px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0"
            style={{
              fontFamily: "var(--font-sans-medium)",
              backgroundColor: activeFilter === i ? "var(--color-darkest)" : "rgba(18,30,23,0.03)",
              color: activeFilter === i ? "var(--color-cream)" : "var(--color-darkest)",
              border: activeFilter === i
                ? "1.5px solid var(--color-darkest)"
                : "1.5px solid rgba(18,30,23,0.08)",
              transition: "all 0.2s ease",
            }}
          >
            {f}
          </motion.button>
        ))}
      </motion.div>

      {/* ── Section header ── */}
      <div className="flex items-center justify-between px-5 pb-3 pt-2 relative z-10">
        <span
          className="text-[11px] font-semibold tracking-wider uppercase opacity-60"
          style={{ color: "var(--color-darkest)", fontFamily: "var(--font-sans-medium)" }}
        >
          موصى به
        </span>
        <span
          className="text-[11px] opacity-60"
          style={{ color: "var(--color-darkest)", fontFamily: "var(--font-sans-light)" }}
        >
          {ARTICLES.length} مقالات
        </span>
      </div>

      {/* ── Grid ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 px-4 pb-28 flex-1 relative z-10"
      >
        {ARTICLES.map((article, index) => (
          <ArticleCard
            key={article.id}
            article={article}
            index={index}
            saved={savedIds.has(article.id)}
            onToggleSave={handleToggleSave}
          />
        ))}
      </motion.div>

      {/* ── Toast ── */}
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}