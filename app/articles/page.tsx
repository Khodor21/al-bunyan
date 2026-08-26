"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { RiBookmarkLine, RiBookmarkFill } from "react-icons/ri";
import { HiOutlineBookOpen } from "react-icons/hi2";
import dynamic from "next/dynamic";

const Emoji = dynamic(
  () => import("emoji-picker-react").then((mod) => mod.Emoji),
  { ssr: false },
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
  country: string;
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
    country: "1f1e6-1f1eb",
  },
  {
    id: "2",
    title: "جنرال الدمار: كيف قاد ملاديتش حرب الإبادة ضد مسلمي البوسنة؟",
    source: "مقالات البنيان",
    sourceInitial: "ب",
    category: "بيان سبيل المجرمين",
    readTime: "١ دقيقة",
    coverImage: "/blogs/Blog-2.jpg",
    url: "#",
    country: "1f1e7-1f1e6",
  },
  {
    id: "3",
    title: "فخ أستانا: عندما تسرق السياسة تضحيات السوريين",
    source: "تاريخ وسياسة",
    sourceInitial: "ت",
    category: "تصحيح المعايير",
    readTime: "١٥ دقيقة",
    coverImage: "/blogs/Blog-3.jpg",
    url: "#",
    country: "1f1f8-1f1fe",
  },
  {
    id: "4",
    title: "أبو عمار في فخ أوسلو: من بندقية الثائر إلى صك التنازل",
    source: "هدوء",
    sourceInitial: "هـ",
    category: "بيان سبيل المجرمين",
    readTime: "٣ دقائق",
    coverImage: "/blogs/Blog-4.jpg",
    url: "#",
    country: "1f1f5-1f1f8",
  },
];

const FILTERS = [
  "الكل",
  "بيان سبيل المجرمين",
  "مقاومة التفاهة",
  "تصحيح المعايير",
  "سنن الله",
];
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        ease: [0.16, 1, 0.3, 1],
        delay: 0.08 + index * 0.07,
      }}
      whileTap={{ scale: 0.98 }}
      className="relative w-full cursor-pointer overflow-hidden"
      style={{
        borderRadius: "20px",
        aspectRatio: "9/9",
      }}
    >
      {/* Full-bleed background image */}
      <img
        src={article.coverImage}
        alt={article.title}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* Dark gradient overlay — heavier at bottom */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.15) 30%, rgba(0,0,0,0.72) 70%, rgba(0,0,0,0.88) 100%)",
        }}
      />

      {/* Flag badge — top right */}
      <div
        className="absolute top-3 right-3 flex items-center justify-center z-10"
        style={{
          backgroundColor: "rgba(255, 254, 254, 0.35)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "8px",
          padding: "3px 5px",
        }}
      >
        <Emoji unified={article.country} size={22} />
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col gap-3 p-3">
        {/* Title */}
        <p
          className="leading-snug"
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

        {/* Action buttons row */}
        <div className="flex flex-row-reverse items-center gap-2">
          {/* Save / Saved button */}
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(article.id);
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-[14px] transition-all"
            style={{
              fontFamily: "var(--font-sans-light)",
              backgroundColor: saved
                ? "var(--color-forest)"
                : "rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              border: saved
                ? "1px solid var(--color-forest)"
                : "1px solid rgba(255,255,255,0.2)",
              color: "#ffffff",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={saved ? "saved" : "unsaved"}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-1.5"
              >
                {saved ? (
                  <>
                    <RiBookmarkFill size={14} />
                    <span>تمت الإضافة</span>
                  </>
                ) : (
                  <>
                    <RiBookmarkLine size={14} />
                    <span>أضف للمفضلة</span>
                  </>
                )}
              </motion.span>
            </AnimatePresence>
          </motion.button>

          {/* Read button */}
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-xs"
            style={{
              fontFamily: "var(--font-sans-medium)",
              backgroundColor: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "var(--color-cream)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            <HiOutlineBookOpen size={16} />
            <span>اقرأ</span>
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
      2200,
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

  const filteredArticles =
    activeFilter === 0
      ? ARTICLES
      : ARTICLES.filter(
          (article) => article.category === FILTERS[activeFilter],
        );

  return (
    <div
      className="min-h-dvh w-screen overflow-x-hidden flex flex-col relative"
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
          src="/titles/Blogs-Title.svg"
          alt="المقالات"
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
              fontFamily:
                activeFilter === i
                  ? "var(--font-sans-medium)"
                  : "var(--font-sans-light)",
              backgroundColor:
                activeFilter === i
                  ? "var(--color-darkest)"
                  : "rgba(18,30,23,0.03)",
              color:
                activeFilter === i
                  ? "var(--color-cream)"
                  : "var(--color-darkest)",
              border:
                activeFilter === i
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
      <div className="flex items-center justify-between px-4 pb-3 pt-1 relative z-10">
        <span
          className="text-sm tracking-wider uppercase opacity-60"
          style={{
            color: "var(--color-darkest)",
            fontFamily: "var(--font-sans-medium)",
          }}
        >
          {FILTERS[activeFilter]}
        </span>
        <span
          className="text-[11px] opacity-60"
          style={{
            color: "var(--color-darkest)",
            fontFamily: "var(--font-sans-light)",
          }}
        >
          {filteredArticles.length} مقالات
        </span>
      </div>

      {/* ── Single-column vertical stack ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
        className="flex flex-col gap-3 px-4 pb-14 md:pb-28 flex-1 relative z-10"
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

      <Toast
        message={toast.message}
        visible={toast.visible}
        onClose={closeToast}
      />
    </div>
  );
}
