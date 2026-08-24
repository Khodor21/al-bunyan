"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { RiBookmarkLine, RiBookmarkFill } from "react-icons/ri";
import dynamic from "next/dynamic";

const Emoji = dynamic(
  () => import("emoji-picker-react").then((mod) => mod.Emoji),
  { ssr: false }
);

// ── Types ─────────────────────────────────────────────────────────────────────

interface Article {
  id: string;
  title: string;
  source: string;
  sourceInitial: string;
  category: string;
  readTime: string;
  coverImage: string;
  url: string;
  country: string; // Unified hex code for the flag emoji
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const ARTICLES: Article[] = [
  {
    id: "1",
    title: "مذبحة قلعة جانغي: عندما تُباد لقولك لا إله إلا الله",
    source: "مقالات البنيان",
    sourceInitial: "ب",
    category: "بيان سبيل المجرمين",
    readTime: "٢ دقيقة",
    coverImage: "/blogs/Blog-1.jpg",
    url: "#",
    country: "1f1e6-1f1eb", // Afghanistan Flag
  },
  {
    id: "2",
    title: "وهم النضج، حين يختبئ الجهل في ثوب الحكمة",
    source: "مقالات البنيان",
    sourceInitial: "ب",
    category: "تصحيح المعايير",
    readTime: "١ دقيقة",
    coverImage: "/blogs/Blog-1.jpg",
    url: "#",
    country: "1f1ea-1f1ec", // Egypt Flag
  },
  {
    id: "3",
    title: "تاريخ العبيد والعبودية عبر الحضارات",
    source: "تاريخ وسياسة",
    sourceInitial: "ت",
    category: "بيان سبيل المجرمين",
    readTime: "١٥ دقيقة",
    coverImage: "/blogs/Blog-1.jpg",
    url: "#",
    country: "1f1f5-1f1f8", // Palestine Flag
  },
  {
    id: "4",
    title: "العلوم التي سرقها الغرب من المسلمين: التاريخ المنسي",
    source: "هدوء",
    sourceInitial: "هـ",
    category: "بيان سبيل المجرمين",
    readTime: "٣ دقائق",
    coverImage: "/blogs/Blog-1.jpg",
    url: "#",
    country: "1f1f8-1f1fe", // Syria Flag
  },
];

const FILTERS = ["الكل", "بيان سبيل المجرمين", "مقاومة التفاهة", "تصحيح المعايير", "أدب"];
const STORAGE_KEY = "ss_saved_articles";

// ── Toast ─────────────────────────────────────────────────────────────────────

function Toast({
  message,
  visible,
  onClose,
}: {
  message: string;
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.96 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed top-5 left-4 right-4 z-[60] max-w-md mx-auto"
          dir="rtl"
        >
          <div
            className="px-4 py-3 rounded-2xl shadow-xl border flex items-center justify-between gap-3 text-xs backdrop-blur-md"
            style={{
              backgroundColor: "var(--color-darkest)",
              color: "var(--color-cream)",
              borderColor: "rgba(255,255,255,0.12)",
              fontFamily: "var(--font-sans-light)",
            }}
          >
            <div className="flex items-center gap-2">
              <Emoji unified="1f514" size={16} />
              <span className="mt-0.5">{message}</span>
            </div>
            <button
              onClick={onClose}
              className="opacity-50 hover:opacity-100 px-1 transition-opacity"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
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
      className="rounded-lg overflow-hidden cursor-pointer flex flex-col relative z-10"
      style={{
        backgroundColor: "var(--color-cream)",
        border: "1px solid rgba(18,30,23,0.08)",
      }}
    >
      {/* Cover image & Flag */}
      <div className="relative w-full flex-shrink-0" style={{ aspectRatio: "4/3" }}>
        <img
          src={article.coverImage}
          alt={article.title}
          className="w-full h-full object-cover"
          draggable={false}
        />
        {/* Country Flag Overlay */}
        <div className="absolute top-2 right-2 bg-black/30 backdrop-blur-md border border-white/10 rounded-md px-1.5 py-1 flex items-center justify-center z-10">
          <Emoji unified={article.country} size={14} />
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-col gap-1.5 flex-1 p-2.5 pb-2">
        <div className="flex items-center gap-1.5">
          {/* Category */}
          <div
            className="rounded-full flex-shrink-0 flex items-center justify-center text-[11px]"
            style={{
              color: "var(--color-forest)",
            }}
          >
            {article.category}
          </div>
        </div>

        {/* Title */}
        <p
          className="text-sm mt-0.5"
          style={{
            color: "var(--color-darkest)",
            fontFamily: "var(--font-sans-medium)",
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

  const closeToast = () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast((t) => ({ ...t, visible: false }));
  };

  const handleToggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showToast("تمت إزالة المقال من المحفوظات");
      } else {
        next.add(id);
        showToast("تم حفظ المقال");
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  // Derive filtered articles based on the active filter state
  const filteredArticles =
    activeFilter === 0
      ? ARTICLES
      : ARTICLES.filter((article) => article.category === FILTERS[activeFilter]);

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
        className="flex items-center justify-between py-6 px-4 z-10 w-full"
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
          <MdOutlineKeyboardArrowRight size={14} />
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
        className="flex gap-2 px-4 py-3 overflow-x-auto relative z-10"
        style={{ scrollbarWidth: "none" }}
      >
        {FILTERS.map((f, i) => (
          <motion.button
            key={f}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveFilter(i)}
            className="px-4 py-1.5 rounded-full text-xs whitespace-nowrap flex-shrink-0"
            style={{
              fontFamily: activeFilter === i ? "var(--font-sans-medium)" : "var(--font-sans-light)",
              backgroundColor: activeFilter === i ? "var(--color-darkest)" : "rgba(18,30,23,0.03)",
              color: activeFilter === i ? "var(--color-cream)" : "var(--color-darkest)",
              border: activeFilter === i
                ? "1.5px solid var(--color-darkest)"
                : "0.5px solid rgba(18,30,23,0.08)",
              transition: "all 0.2s ease",
            }}
          >
            {f}
          </motion.button>
        ))}
      </motion.div>

      {/* ── Section header ── */}
      <div className="flex items-center justify-between px-4 pb-3 pt-2 relative z-10">
        <span
          className="text-sm tracking-wider uppercase opacity-60"
          style={{ color: "var(--color-darkest)", fontFamily: "var(--font-sans-medium)" }}
        >
          {FILTERS[activeFilter]}
        </span>
        <span
          className="text-[11px] opacity-60"
          style={{ color: "var(--color-darkest)", fontFamily: "var(--font-sans-light)" }}
        >
          {filteredArticles.length} مقالات
        </span>
      </div>

      {/* ── Grid ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 px-4 pb-14 md:pb-28 flex-1 relative z-10"
      >
        <AnimatePresence mode="popLayout">
          {filteredArticles.map((article, index) => (
            <ArticleCard
              key={article.id}
              article={article}
              index={index}
              saved={savedIds.has(article.id)}
              onToggleSave={handleToggleSave}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* ── Toast ── */}
      <Toast message={toast.message} visible={toast.visible} onClose={closeToast} />
    </div>
  );
}