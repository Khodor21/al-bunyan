"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { PiX, PiLightbulb } from "react-icons/pi";
import { Emoji } from "emoji-picker-react";
import type { QuizQuestion } from "./VideoContentPage";

// ── Types ──────────────────────────────────────────────────
interface QuizPageProps {
  questions: QuizQuestion[];
  contentTitle: string;
  nextContent?: { id: string; title: string; type: "مقرر مقروء" | "مقرر مسموع" | "مقرر مرئي" };
  onClose: () => void;
  onDone?: (score: number, total: number) => Promise<void>;
}

type AnswerState = "idle" | "correct" | "wrong";

const TYPE_CONFIG: Record<string, { unified: string }> = {
  "مقرر مقروء": { unified: "1f4d6" },
  "مقرر مسموع": { unified: "1f3a7" },
  "مقرر مرئي": { unified: "1f3ac" },
};

// ── Result bar (matches screenshot) ───────────────────────
function ResultBar({ correct, wrong, total }: { correct: number; wrong: number; total: number }) {
  const unanswered = total - correct - wrong;
  const pct = Math.round((correct / total) * 100);
  const circumference = 2 * Math.PI * 14;

  return (
    <div
      className="w-full rounded-2xl px-4 py-4 flex items-center justify-between gap-1"
      style={{ border: "1px solid rgba(18,30,23,0.09)", backgroundColor: "var(--color-cream)" }}
      dir="rtl"
    >
      {/* Degree */}
      <div className="flex items-center gap-2">
        <div className="relative w-10 h-10 flex-shrink-0">
          <svg width="40" height="40" className="-rotate-90">
            <circle cx="20" cy="20" r="14" fill="none" stroke="rgba(18,30,23,0.08)" strokeWidth="2.5" />
            <circle
              cx="20" cy="20" r="14" fill="none"
              stroke={pct >= 60 ? "var(--color-forest, #2d5a3d)" : "#e07030"}
              strokeWidth="2.5" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - pct / 100)}
              style={{ transition: "stroke-dashoffset 0.6s ease" }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[9px]"
            style={{ fontFamily: "var(--font-sans-medium)", color: pct >= 60 ? "var(--color-forest)" : "#e07030" }}>
            {pct}%
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs opacity-40" style={{ fontFamily: "var(--font-sans-light)" }}>الدرجة</span>
          <span className="text-sm" style={{ fontFamily: "var(--font-sans-medium)" }}>{total}/{correct}</span>
        </div>
      </div>

      <div style={{ width: "1px", height: "36px", backgroundColor: "rgba(18,30,23,0.07)", flexShrink: 0 }} />

      <div className="flex flex-col items-center gap-1">
        <span className="text-xs opacity-40 text-center" style={{ fontFamily: "var(--font-sans-light)" }}>إجابات صحيحة</span>
        <div className="flex items-center gap-1">
          <span className="text-sm" style={{ fontFamily: "var(--font-sans-medium)" }}>{correct}</span>
          <span style={{ color: "#2d7a3d", fontSize: 14 }}>✓</span>
        </div>
      </div>

      <div style={{ width: "1px", height: "36px", backgroundColor: "rgba(18,30,23,0.07)", flexShrink: 0 }} />

      <div className="flex flex-col items-center gap-1">
        <span className="text-xs opacity-40 text-center" style={{ fontFamily: "var(--font-sans-light)" }}>إجابات خاطئة</span>
        <div className="flex items-center gap-1">
          <span className="text-sm" style={{ fontFamily: "var(--font-sans-medium)" }}>{wrong}</span>
          <PiX size={13} color="#c0392b" />
        </div>
      </div>

      <div style={{ width: "1px", height: "36px", backgroundColor: "rgba(18,30,23,0.07)", flexShrink: 0 }} />

      <div className="flex flex-col items-center gap-1">
        <span className="text-xs opacity-40 text-center" style={{ fontFamily: "var(--font-sans-light)" }}>لم تتم</span>
        <div className="flex items-center gap-1">
          <span className="text-sm" style={{ fontFamily: "var(--font-sans-medium)" }}>{unanswered}</span>
          <span style={{ color: "#e07030", fontSize: 13 }}>⚠</span>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────
export default function QuizPage({ questions, contentTitle, nextContent, onClose, onDone }: QuizPageProps) {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>("idle");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showHint, setShowHint] = useState(false);
  const [done, setDone] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const q = questions[current];
  const isLast = current === questions.length - 1;

  const correctCount = Object.entries(answers).filter(
    ([qId, aId]) => questions.find((qq) => qq.id === qId)?.correctId === aId
  ).length;
  const wrongCount = Object.keys(answers).length - correctCount;

  function handleSelect(optId: string) {
    if (answerState !== "idle") return;
    setSelected(optId);
    setAnswerState(optId === q.correctId ? "correct" : "wrong");
    setAnswers((prev) => ({ ...prev, [q.id]: optId }));
  }

  function handleNext() {
    if (isLast) {
      setShowSubmitModal(true);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setAnswerState("idle");
      setShowHint(false);
    }
  }

  async function handleSubmit() {
    setShowSubmitModal(false);
    const score = Object.entries({ ...answers }).filter(
      ([qId, aId]) => questions.find((qq) => qq.id === qId)?.correctId === aId
    ).length;
    await onDone?.(score, questions.length);
    setDone(true);
  }

  function handleRetry() {
    setCurrent(0);
    setSelected(null);
    setAnswerState("idle");
    setAnswers({});
    setShowHint(false);
    setDone(false);
  }

  // ── Results screen ─────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-dvh w-screen flex flex-col overflow-x-hidden" dir="rtl"
        style={{ backgroundColor: "var(--color-cream)", color: "var(--color-darkest)" }}>
        <div className="sticky top-0 z-30 w-full"
          style={{ backgroundColor: "var(--color-cream)", borderBottom: "1px solid rgba(18,30,23,0.06)" }}>
          <div className="flex items-center justify-between py-4 px-4 max-w-md mx-auto w-full">
            <motion.button whileTap={{ scale: 0.97 }} onClick={onClose} className="p-2 rounded-full"
              style={{ backgroundColor: "rgba(18,30,23,0.03)", border: "1px solid rgba(18,30,23,0.08)" }}>
              <MdOutlineKeyboardArrowRight size={14} />
            </motion.button>
            <span className="text-sm" style={{ fontFamily: "var(--font-sans-light)", opacity: 0.5 }}>نتيجة الاختبار</span>
            <div />
          </div>
        </div>

        <main className="flex-1 px-3 pt-8 pb-44 max-w-md w-full mx-auto">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-6">
            <p className="text-xs opacity-40 mb-1" style={{ fontFamily: "var(--font-sans-light)" }}>{contentTitle}</p>
            <h1 className="text-lg" style={{ fontFamily: "var(--font-sans-medium)" }}>
              {correctCount >= questions.length * 0.6 ? "أحسنت 🎉" : "حاول مجدداً"}
            </h1>
            <p className="text-sm mt-1 opacity-60" style={{ fontFamily: "var(--font-sans-light)" }}>
              أجبت عن {correctCount} من {questions.length} بشكل صحيح
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
            <ResultBar correct={correctCount} wrong={wrongCount} total={questions.length} />
          </motion.div>

          <div className="flex flex-col gap-3">
            {questions.map((qq, idx) => {
              const userAns = answers[qq.id];
              const isRight = userAns === qq.correctId;
              return (
                <motion.div key={qq.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + idx * 0.05 }}
                  className="rounded-2xl p-4"
                  style={{ backgroundColor: "rgba(18,30,23,0.03)", border: "1px solid rgba(18,30,23,0.07)" }}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-xs leading-relaxed flex-1" style={{ fontFamily: "var(--font-sans-medium)", lineHeight: "1.8" }}>
                      {idx + 1}. {qq.question}
                    </p>
                    {isRight
                      ? <span style={{ color: "#2d7a3d", fontSize: 14, flexShrink: 0 }}>✓</span>
                      : <PiX size={13} color="#c0392b" style={{ flexShrink: 0, marginTop: 3 }} />}
                  </div>
                  {!isRight && (
                    <p className="text-xs mt-1" style={{ fontFamily: "var(--font-sans-light)", color: "var(--color-forest)", opacity: 0.8 }}>
                      الصحيح: {qq.options.find((o) => o.id === qq.correctId)?.text}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </main>

        <div className="fixed bottom-0 left-0 right-0 z-30 px-6 pb-8 pt-4"
          style={{ background: "linear-gradient(to top, var(--color-cream) 70%, transparent)" }}>
          <div className="max-w-md mx-auto flex flex-col gap-3">
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleRetry}
              className="flex items-center justify-center w-full py-3 rounded-2xl text-xs"
              style={{ fontFamily: "var(--font-sans-medium)", backgroundColor: "rgba(18,30,23,0.05)", border: "1px solid rgba(18,30,23,0.09)", color: "var(--color-darkest)" }}>
              إعادة الاختبار
            </motion.button>
            <motion.button whileTap={{ scale: 0.97 }}
              onClick={() => nextContent ? router.push(`/content/${nextContent.id}`) : onClose()}
              className="flex items-center justify-center w-full py-3.5 rounded-2xl text-sm"
              style={{ fontFamily: "var(--font-sans-medium)", backgroundColor: "var(--color-forest, #2d5a3d)", color: "#fff" }}>
              {nextContent ? "المحتوى التالي" : "العودة إلى المسار"}
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz screen ───────────────────────────────────────
  return (
    <div className="min-h-dvh w-screen flex flex-col overflow-x-hidden" dir="rtl"
      style={{ backgroundColor: "var(--color-cream)", color: "var(--color-darkest)" }}>
      {/* Top bar */}
      <div className="sticky top-0 z-30 w-full"
        style={{ backgroundColor: "var(--color-cream)", borderBottom: "1px solid rgba(18,30,23,0.06)" }}>
        <div className="absolute bottom-0 left-0 h-[2px]"
          style={{ backgroundColor: "var(--color-forest)", width: `${((current + 1) / questions.length) * 100}%`, transition: "width 0.3s ease" }} />
        <div className="flex items-center justify-between py-4 px-4 max-w-md mx-auto w-full">
          <motion.button whileTap={{ scale: 0.97 }} onClick={onClose} className="p-2 rounded-full"
            style={{ backgroundColor: "rgba(18,30,23,0.03)", border: "1px solid rgba(18,30,23,0.08)" }}>
            <MdOutlineKeyboardArrowRight size={14} />
          </motion.button>
          <span className="text-xs" style={{ fontFamily: "var(--font-sans-light)", opacity: 0.45 }}>
            السؤال {current + 1} من {questions.length}
          </span>
          <div />
        </div>
      </div>

      <main className="flex-1 px-3 pt-8 pb-44 max-w-md w-full mx-auto">
        <p className="text-xs opacity-40 mb-6" style={{ fontFamily: "var(--font-sans-light)" }}>
          {contentTitle} — اختبر فهمك
        </p>

        <AnimatePresence mode="wait">
          <motion.div key={q.id}
            initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>

            <h2 className="text-base leading-relaxed mb-6"
              style={{ fontFamily: "var(--font-sans-medium)", lineHeight: "1.9" }}>
              {q.question}
            </h2>

            {/* Options */}
            <div className="flex flex-col gap-3 mb-5">
              {q.options.map((opt) => {
                const isSelected = selected === opt.id;
                const isCorrectOpt = opt.id === q.correctId;
                let bg = "rgba(18,30,23,0.03)";
                let border = "1px solid rgba(18,30,23,0.08)";
                let color = "var(--color-darkest)";

                if (answerState !== "idle") {
                  if (isCorrectOpt) { bg = "rgba(45,90,61,0.08)"; border = "1px solid rgba(45,90,61,0.3)"; color = "var(--color-forest)"; }
                  else if (isSelected) { bg = "rgba(192,57,43,0.07)"; border = "1px solid rgba(192,57,43,0.25)"; color = "#c0392b"; }
                }

                return (
                  <motion.button key={opt.id}
                    whileTap={answerState === "idle" ? { scale: 0.98 } : {}}
                    onClick={() => handleSelect(opt.id)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-right"
                    style={{ backgroundColor: bg, border, color, cursor: answerState !== "idle" ? "default" : "pointer" }}>
                    <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                      style={{ backgroundColor: "rgba(18,30,23,0.06)", fontFamily: "var(--font-sans-medium)" }}>
                      {opt.label}
                    </span>
                    <span className="text-sm flex-1 text-right" style={{ fontFamily: "var(--font-sans-light)", lineHeight: "1.6" }}>
                      {opt.text}
                    </span>
                    {answerState !== "idle" && isCorrectOpt && <span style={{ fontSize: 13, flexShrink: 0 }}>✓</span>}
                    {answerState !== "idle" && isSelected && !isCorrectOpt && <PiX size={13} style={{ flexShrink: 0 }} />}
                  </motion.button>
                );
              })}
            </div>

            {/* Hint */}
            {q.hint && (
              <AnimatePresence>
                {!showHint ? (
                  <motion.button key="hint-btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setShowHint(true)}
                    className="flex items-center gap-1.5 text-xs mb-4"
                    style={{ fontFamily: "var(--font-sans-light)", opacity: 0.4, color: "var(--color-darkest)" }}>
                    <PiLightbulb size={13} />
                    عرض التلميح
                  </motion.button>
                ) : (
                  <motion.div key="hint-box" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl px-4 py-3 mb-4"
                    style={{ backgroundColor: "rgba(18,30,23,0.04)", border: "1px solid rgba(18,30,23,0.07)" }}>
                    <p className="text-xs leading-relaxed"
                      style={{ fontFamily: "var(--font-sans-light)", opacity: 0.65, lineHeight: "1.8" }}>
                      💡 {q.hint}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* Feedback */}
            <AnimatePresence>
              {answerState !== "idle" && (
                <motion.div key="feedback" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl px-4 py-3"
                  style={{
                    backgroundColor: answerState === "correct" ? "rgba(45,90,61,0.07)" : "rgba(192,57,43,0.06)",
                    border: `1px solid ${answerState === "correct" ? "rgba(45,90,61,0.2)" : "rgba(192,57,43,0.18)"}`,
                  }}>
                  <p className="text-xs" style={{
                    fontFamily: "var(--font-sans-medium)",
                    color: answerState === "correct" ? "var(--color-forest)" : "#c0392b"
                  }}>
                    {answerState === "correct" ? "✓ إجابة صحيحة" : "✕ إجابة خاطئة"}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 px-6 pb-8 pt-4"
        style={{ background: "linear-gradient(to top, var(--color-cream) 70%, transparent)" }}>
        <div className="max-w-md mx-auto">
          <AnimatePresence>
            {answerState !== "idle" && (
              <motion.button key="next"
                initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                whileTap={{ scale: 0.97 }}
                onClick={handleNext}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm"
                style={{ fontFamily: "var(--font-sans-medium)", backgroundColor: "var(--color-forest, #2d5a3d)", color: "#fff" }}>
                {isLast ? "إنهاء الاختبار" : "السؤال التالي"}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Submit modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <>
            <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              style={{ backgroundColor: "rgba(18,30,23,0.35)", backdropFilter: "blur(4px)" }}
              onClick={() => setShowSubmitModal(false)} />
            <motion.div key="modal"
              initial={{ opacity: 0, y: 40, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-8 pt-6 rounded-t-3xl max-w-md mx-auto"
              style={{ backgroundColor: "var(--color-cream)", border: "1px solid rgba(18,30,23,0.08)" }}
              dir="rtl">
              <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ backgroundColor: "rgba(18,30,23,0.1)" }} />
              <h3 className="text-base mb-1" style={{ fontFamily: "var(--font-sans-medium)" }}>إنهاء الاختبار؟</h3>
              <p className="text-xs mb-6 opacity-50" style={{ fontFamily: "var(--font-sans-light)" }}>
                أجبت عن {Object.keys(answers).length} من {questions.length} أسئلة.
              </p>
              <div className="flex flex-col gap-3">
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit}
                  className="w-full py-3.5 rounded-2xl text-sm"
                  style={{ fontFamily: "var(--font-sans-medium)", backgroundColor: "var(--color-forest, #2d5a3d)", color: "#fff" }}>
                  نعم، أنهِ الاختبار
                </motion.button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowSubmitModal(false)}
                  className="w-full py-3 rounded-2xl text-xs"
                  style={{ fontFamily: "var(--font-sans-medium)", backgroundColor: "rgba(18,30,23,0.05)", border: "1px solid rgba(18,30,23,0.09)", color: "var(--color-darkest)" }}>
                  العودة للاختبار
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}