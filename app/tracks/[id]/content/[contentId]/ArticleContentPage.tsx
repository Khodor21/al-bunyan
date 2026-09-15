"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { PiDownloadSimple, PiCheckFat } from "react-icons/pi";
import { Emoji } from "emoji-picker-react";
import { useContentProgress } from "@/hooks/useContentProgress";

// ── Types ──────────────────────────────────────────────────
export type ArticleSection = {
  id: string;
  heading?: string;
  body: string;
};

export type ArticleContent = {
  id: string;
  trackId: string;
  title: string;
  type: "مقرر مقروء" | "مقرر مسموع";
  readingMinutes?: number;
  pdfPath?: string;
  sections?: ArticleSection[];
};

// ── Constants ──────────────────────────────────────────────
const TYPE_EMOJI: Record<ArticleContent["type"], string> = {
  "مقرر مقروء": "1f4d6",
  "مقرر مسموع": "1f3a7",
};

// ── Hook ───────────────────────────────────────────────────
function useScrollProgress(ref: React.RefObject<HTMLElement>) {
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = el.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
      setProgress(pct);
      if (pct >= 0.92 && !completed) setCompleted(true);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [ref, completed]);

  return { progress, completed };
}

// ── Component ──────────────────────────────────────────────
export default function ArticleContentPage({
  article,
}: {
  article: ArticleContent;
}) {
  const router = useRouter();
  const articleRef = useRef<HTMLDivElement>(null!);
  const { progress: scrollProgress, completed: scrollCompleted } =
    useScrollProgress(articleRef);
  const { progress, status, saveCompleted } = useContentProgress(article.id);

  const [marked, setMarked] = useState(false);

  // If already completed in DB, mark immediately (no scroll needed)
  useEffect(() => {
    if (status === "ready" && progress?.completed) {
      setMarked(true);
    }
  }, [status, progress]);

  const handleComplete = async () => {
    setMarked(true);
    await saveCompleted();
    setTimeout(() => router.back(), 1200);
  };

  // Show the button once user scrolled 92% OR already completed before
  const showButton =
    scrollCompleted || (status === "ready" && progress?.completed);

  if (status === "loading") return null;

  return (
    <div
      ref={articleRef}
      className="min-h-dvh w-screen flex flex-col relative overflow-x-hidden"
      dir="rtl"
      style={{
        backgroundColor: "var(--color-cream)",
        color: "var(--color-darkest)",
      }}
    >
      {/* Top bar */}
      <div
        className="sticky top-0 z-30 w-full"
        style={{
          backgroundColor: "var(--color-cream)",
          borderBottom: "1px solid rgba(18,30,23,0.06)",
        }}
      >
        <motion.div
          className="absolute bottom-0 left-0 h-[2px]"
          style={{
            backgroundColor: "var(--color-forest)",
            width: `${scrollProgress * 100}%`,
          }}
          transition={{ ease: "linear", duration: 0.1 }}
        />

        <div className="flex items-center justify-between py-4 px-4 max-w-md mx-auto w-full">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => router.back()}
            className="p-2 rounded-full"
            style={{
              backgroundColor: "rgba(18,30,23,0.03)",
              border: "1px solid rgba(18,30,23,0.08)",
            }}
          >
            <MdOutlineKeyboardArrowRight size={14} />
          </motion.button>

          <span
            className="inline-flex items-center gap-1.5 py-1 rounded-full text-sm"
            style={{
              fontFamily: "var(--font-sans-light)",
              color: "var(--color-darkest)",
            }}
          >
            <Emoji unified={TYPE_EMOJI[article.type] ?? "1f4d6"} size={15} />
            {article.type}
          </span>

          <div />
        </div>
      </div>

      {/* Article body */}
      <main className="flex-1 px-3 pt-8 pb-44 max-w-md w-full mx-auto z-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <h1
            className="text-lg leading-relaxed mb-2"
            style={{ fontFamily: "var(--font-sans-medium)" }}
          >
            {article.title}
          </h1>
          {article.readingMinutes && (
            <span
              className="text-xs opacity-40"
              style={{ fontFamily: "var(--font-sans-light)" }}
            >
              {article.readingMinutes} دقائق للقراءة
            </span>
          )}
        </motion.div>

        <div className="flex flex-col gap-6">
          {(article.sections ?? []).map((section, idx) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.04 }}
              className="flex flex-col gap-2"
            >
              {section.heading && (
                <h2
                  className="text-sm"
                  style={{
                    fontFamily: "var(--font-sans-medium)",
                    color: "var(--color-forest)",
                  }}
                >
                  {section.heading}
                </h2>
              )}
              <p
                className="text-sm"
                style={{
                  fontFamily: "var(--font-sans-light)",
                  opacity: 0.82,
                  lineHeight: "2",
                  whiteSpace: "pre-wrap",
                }}
              >
                {section.body}
              </p>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Bottom action bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-30 px-6 pb-8 pt-4"
        style={{
          background:
            "linear-gradient(to top, var(--color-cream) 70%, transparent)",
        }}
      >
        <div className="max-w-md mx-auto flex flex-col gap-3">
          {article.pdfPath && (
            <motion.a
              href={article.pdfPath}
              download
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-xs transition-all"
              style={{
                fontFamily: "var(--font-sans-medium)",
                backgroundColor: "rgba(18,30,23,0.04)",
                border: "1px solid rgba(18,30,23,0.08)",
                color: "var(--color-darkest)",
                textDecoration: "none",
              }}
            >
              <PiDownloadSimple size={15} />
              تحميل المقرر PDF
            </motion.a>
          )}

          <AnimatePresence>
            {showButton && (
              <motion.button
                key="complete"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                onClick={handleComplete}
                disabled={marked}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm transition-all"
                style={{
                  fontFamily: "var(--font-sans-medium)",
                  backgroundColor: marked
                    ? "rgba(60,100,70,0.12)"
                    : "var(--color-forest, #2d5a3d)",
                  color: marked ? "var(--color-forest)" : "#fff",
                  border: marked ? "1px solid rgba(60,100,70,0.2)" : "none",
                }}
              >
                <AnimatePresence mode="wait">
                  {marked ? (
                    <motion.span
                      key="done"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2"
                    >
                      <PiCheckFat size={16} />
                      تم التسجيل ✓
                    </motion.span>
                  ) : (
                    <motion.span
                      key="cta"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2"
                    >
                      <PiCheckFat size={16} />
                      أكملت القراءة
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
