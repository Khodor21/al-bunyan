"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { PiCheckFat, PiYoutubeLogo } from "react-icons/pi";
import { HiOutlineExternalLink } from "react-icons/hi";
import { Emoji } from "emoji-picker-react";
import { useContentProgress } from "@/hooks/useContentProgress";
import QuizPage from "./QuizPage";

// ── Types ──────────────────────────────────────────────────
type ContentState = "idle" | "watched" | "completed";

export interface QuizQuestion {
  id: string;
  question: string;
  options: { id: string; label: string; text: string }[];
  correctId: string;
  hint?: string;
}

export interface VideoContent {
  id: string;
  trackId: string;
  trackName?: string;
  lessonIndex?: number;
  totalLessons?: number;
  title: string;
  type: "مقرر مرئي";
  description: string;
  durationMinutes: number;
  youtubeUrl: string;
  youtubeThumbnail?: string;
  hasQuiz: boolean;
  quiz?: QuizQuestion[];
  nextContent?: {
    id: string;
    title: string;
    type: "مقرر مقروء" | "مقرر مسموع" | "مقرر مرئي";
  };
}

// ── Config ─────────────────────────────────────────────────
const TYPE_CONFIG: Record<string, { unified: string }> = {
  "مقرر مقروء": { unified: "1f4d6" },
  "مقرر مسموع": { unified: "1f3a7" },
  "مقرر مرئي": { unified: "1f3ac" },
};

function getYoutubeThumbnail(url: string): string {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  if (match) return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  return "";
}

// ── Component ──────────────────────────────────────────────
export default function VideoContentPage({ video }: { video: VideoContent }) {
  const router = useRouter();
  const { progress, status, saveCompleted, saveQuizResult } =
    useContentProgress(video.id);

  const [state, setState] = useState<ContentState>("idle");
  const [quizDismissed, setQuizDismissed] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  // Hydrate local state from DB once loaded
  useEffect(() => {
    if (status === "ready" && progress?.completed) {
      setState("completed");
    }
  }, [status, progress]);

  const thumbnail =
    video.youtubeThumbnail || getYoutubeThumbnail(video.youtubeUrl);
  const isCompleted = state === "completed";

  const handleComplete = async () => {
    setState("completed");
    await saveCompleted();
  };

  const handleQuizDone = async (score: number, total: number) => {
    await saveQuizResult(score, total);
    setShowQuiz(false);
  };

  if (status === "loading") return null;

  if (showQuiz && video.quiz) {
    return (
      <QuizPage
        questions={video.quiz}
        contentTitle={video.title}
        nextContent={video.nextContent}
        onClose={() => setShowQuiz(false)}
        onDone={handleQuizDone}
      />
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
      {/* ── Sticky top bar ── */}
      <div
        className="sticky top-0 z-30 w-full"
        style={{
          backgroundColor: "var(--color-cream)",
          borderBottom: "1px solid rgba(18,30,23,0.06)",
        }}
      >
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
            <Emoji
              unified={TYPE_CONFIG[video.type]?.unified ?? "1f3ac"}
              size={15}
            />
            {video.type}
          </span>

          <div />
        </div>
      </div>

      {/* ── Main content ── */}
      <main className="flex-1 px-3 pt-8 pb-44 max-w-md w-full mx-auto z-10">
        {/* Track breadcrumb */}
        {(video.trackName || video.lessonIndex) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 flex flex-col gap-0.5"
          >
            {video.trackName && (
              <span
                className="text-xs"
                style={{
                  fontFamily: "var(--font-sans-light)",
                  color: "var(--color-forest)",
                  opacity: 0.7,
                }}
              >
                {video.trackName}
              </span>
            )}
            {video.lessonIndex && video.totalLessons && (
              <span
                className="text-xs"
                style={{ fontFamily: "var(--font-sans-light)", opacity: 0.4 }}
              >
                الحلقة {video.lessonIndex} من {video.totalLessons}
              </span>
            )}
          </motion.div>
        )}

        {/* Title + meta */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mb-5"
        >
          <h1
            className="text-lg leading-relaxed mb-2"
            style={{ fontFamily: "var(--font-sans-medium)" }}
          >
            {video.title}
          </h1>
          <span
            className="text-xs opacity-40"
            style={{ fontFamily: "var(--font-sans-light)" }}
          >
            {video.durationMinutes} دقيقة
          </span>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.06 }}
          className="text-sm mb-5"
          style={{
            fontFamily: "var(--font-sans-light)",
            opacity: 0.75,
            lineHeight: "2",
          }}
        >
          {video.description}
        </motion.p>

        {/* ── Video card ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-3"
        >
          <a
            href={video.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block relative rounded-2xl overflow-hidden"
            style={{
              border: "1px solid rgba(18,30,23,0.08)",
              textDecoration: "none",
            }}
            onClick={() => {
              if (state === "idle") setState("watched");
            }}
          >
            {thumbnail ? (
              <img
                src={thumbnail}
                alt={video.title}
                className="w-full object-cover"
                style={{ aspectRatio: "16/9", display: "block" }}
              />
            ) : (
              <div
                className="w-full flex items-center justify-center"
                style={{
                  aspectRatio: "16/9",
                  backgroundColor: "rgba(18,30,23,0.05)",
                }}
              >
                <PiYoutubeLogo size={40} style={{ opacity: 0.2 }} />
              </div>
            )}

            <div
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{
                background:
                  "linear-gradient(to top, rgba(18,30,23,0.55) 0%, rgba(18,30,23,0.1) 60%, transparent 100%)",
              }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
                style={{
                  backgroundColor: "rgba(255,255,255,0.95)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  style={{ marginRight: "-2px" }}
                >
                  <path
                    d="M5 3.5L17 10L5 16.5V3.5Z"
                    fill="var(--color-forest, #2d5a3d)"
                  />
                </svg>
              </div>

              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{
                  backgroundColor: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(6px)",
                  border: "1px solid rgba(255,255,255,0.25)",
                }}
              >
                <span
                  className="text-xs"
                  style={{
                    fontFamily: "var(--font-sans-medium)",
                    color: "#fff",
                  }}
                >
                  مشاهدة الحلقة
                </span>
                <HiOutlineExternalLink size={12} color="#fff" />
              </div>
            </div>
          </a>

          <p
            className="text-center mt-2 text-xs"
            style={{ fontFamily: "var(--font-sans-light)", opacity: 0.35 }}
          >
            تُشاهَد عبر YouTube
          </p>
        </motion.div>

        {/* ── Quiz result badge (if already done) ── */}
        {progress?.quizScore != null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 px-4 py-3 rounded-2xl flex items-center justify-between"
            style={{
              backgroundColor: "rgba(18,30,23,0.03)",
              border: "1px solid rgba(18,30,23,0.07)",
            }}
          >
            <span
              className="text-xs"
              style={{ fontFamily: "var(--font-sans-light)", opacity: 0.6 }}
            >
              نتيجة الاختبار السابق
            </span>
            <span
              className="text-sm"
              style={{
                fontFamily: "var(--font-sans-medium)",
                color: "var(--color-forest)",
              }}
            >
              {progress.quizScore} / {progress.quizTotal}
            </span>
          </motion.div>
        )}

        {/* ── Post-completion area ── */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              key="post-completion"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-3 mt-6"
            >
              {video.hasQuiz &&
                !quizDismissed &&
                progress?.quizScore == null && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-2xl p-4"
                    style={{
                      backgroundColor: "rgba(18,30,23,0.03)",
                      border: "1px solid rgba(18,30,23,0.07)",
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p
                          className="text-sm mb-0.5"
                          style={{ fontFamily: "var(--font-sans-medium)" }}
                        >
                          اختبر فهمك
                        </p>
                        <p
                          className="text-xs"
                          style={{
                            fontFamily: "var(--font-sans-light)",
                            opacity: 0.5,
                          }}
                        >
                          اختياري — بضعة أسئلة عن الحلقة
                        </p>
                      </div>
                      <button
                        onClick={() => setQuizDismissed(true)}
                        className="text-xs p-1"
                        style={{
                          opacity: 0.3,
                          fontFamily: "var(--font-sans-light)",
                        }}
                      >
                        ✕
                      </button>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setShowQuiz(true)}
                      className="w-full py-2.5 rounded-xl text-xs"
                      style={{
                        fontFamily: "var(--font-sans-medium)",
                        backgroundColor: "rgba(18,30,23,0.06)",
                        border: "1px solid rgba(18,30,23,0.09)",
                        color: "var(--color-darkest)",
                      }}
                    >
                      ابدأ الاختبار
                    </motion.button>
                  </motion.div>
                )}

              {video.nextContent && (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: video.hasQuiz && !quizDismissed ? 0.18 : 0.1,
                  }}
                  onClick={() =>
                    router.push(`/content/${video.nextContent!.id}`)
                  }
                  className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-right"
                  style={{
                    backgroundColor: "rgba(18,30,23,0.03)",
                    border: "1px solid rgba(18,30,23,0.07)",
                  }}
                >
                  <div className="flex flex-col gap-0.5">
                    <span
                      className="text-xs"
                      style={{
                        fontFamily: "var(--font-sans-light)",
                        opacity: 0.4,
                      }}
                    >
                      المحتوى التالي
                    </span>
                    <span
                      className="text-sm"
                      style={{ fontFamily: "var(--font-sans-medium)" }}
                    >
                      {video.nextContent.title}
                    </span>
                    <span
                      className="inline-flex items-center gap-1 mt-0.5"
                      style={{
                        fontFamily: "var(--font-sans-light)",
                        fontSize: "11px",
                        opacity: 0.45,
                      }}
                    >
                      <Emoji
                        unified={
                          TYPE_CONFIG[video.nextContent.type]?.unified ??
                          "1f4d6"
                        }
                        size={11}
                      />
                      {video.nextContent.type}
                    </span>
                  </div>
                  <MdOutlineKeyboardArrowRight
                    size={18}
                    style={{ opacity: 0.3, flexShrink: 0 }}
                  />
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Bottom action bar ── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-30 px-6 pb-8 pt-4"
        style={{
          background:
            "linear-gradient(to top, var(--color-cream) 70%, transparent)",
        }}
      >
        <div className="max-w-md mx-auto flex flex-col gap-3">
          <AnimatePresence mode="wait">
            {!isCompleted ? (
              state === "watched" && (
                <motion.button
                  key="complete"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  onClick={handleComplete}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm"
                  style={{
                    fontFamily: "var(--font-sans-medium)",
                    backgroundColor: "var(--color-forest, #2d5a3d)",
                    color: "#fff",
                  }}
                >
                  <PiCheckFat size={16} />
                  إتمام المشاهدة
                </motion.button>
              )
            ) : (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm"
                style={{
                  fontFamily: "var(--font-sans-medium)",
                  backgroundColor: "rgba(60,100,70,0.12)",
                  color: "var(--color-forest)",
                  border: "1px solid rgba(60,100,70,0.2)",
                }}
              >
                <PiCheckFat size={16} />
                تم إتمام المحتوى ✓
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
