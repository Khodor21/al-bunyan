"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowRight, FiSend } from "react-icons/fi";
import TopNavbar from "@/components/TopNavbar";
import type { AuthUser } from "@/types/auth";

type Message = {
  role: "user" | "assistant";
  content: string;
};

// ─── Suggested prompts shown on empty state ───────────────────────────────────
const SUGGESTIONS = [
  "من هو حسن البنا؟",
  "ما أبرز أحداث الثورة الجزائرية؟",
  "تحدّث عن نكبة 1948",
  "ما دور الإخوان في السياسة المصرية؟",
];

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: "var(--color-forest)", opacity: 0.5 }}
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

// ─── Single message bubble ────────────────────────────────────────────────────
function Bubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className={`flex w-full ${isUser ? "justify-start" : "justify-end"}`}
    >
      {/* Assistant avatar */}
      {!isUser && (
        <div
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs ml-2 self-end mb-0.5"
          style={{
            backgroundColor: "var(--color-forest)",
            color: "var(--color-cream)",
            fontFamily: "var(--font-sans-medium)",
          }}
        >
          ب
        </div>
      )}

      <div
        className="max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-7"
        style={
          isUser
            ? {
                backgroundColor: "var(--color-forest)",
                color: "var(--color-cream)",
                fontFamily: "var(--font-sans-light)",
                borderBottomLeftRadius: "6px",
              }
            : {
                backgroundColor: "rgba(18,30,23,0.04)",
                color: "var(--color-darkest)",
                fontFamily: "var(--font-sans-light)",
                border: "1px solid rgba(18,30,23,0.07)",
                borderBottomRightRadius: "6px",
              }
        }
      >
        {message.content}
      </div>
    </motion.div>
  );
}

// ─── Empty / welcome state ────────────────────────────────────────────────────
function EmptyState({ onSuggest }: { onSuggest: (q: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center flex-1 gap-8 px-4 py-12"
    >
      {/* Icon */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl"
        style={{
          backgroundColor: "var(--color-forest)",
          color: "var(--color-cream)",
          boxShadow: "0 4px 24px rgba(18,30,23,0.15)",
        }}
      >
        🤖
      </div>

      {/* Copy */}
      <div className="text-center max-w-xs">
        <p
          className="text-base mb-1.5"
          style={{
            fontFamily: "var(--font-sans-medium)",
            color: "var(--color-darkest)",
          }}
        >
          مساعد البنيان الذكي
        </p>
        <p
          className="text-sm leading-relaxed"
          style={{
            fontFamily: "var(--font-sans-light)",
            color: "rgba(18,30,23,0.5)",
          }}
        >
          اسأل عن أي حدث أو شخصية في التاريخ الإسلامي المعاصر
        </p>
      </div>

      {/* Suggestion chips */}
      <div className="flex flex-wrap justify-center gap-2 max-w-sm">
        {SUGGESTIONS.map((s) => (
          <motion.button
            key={s}
            whileTap={{ scale: 0.96 }}
            onClick={() => onSuggest(s)}
            className="px-3.5 py-2 rounded-full text-xs"
            style={{
              backgroundColor: "rgba(18,30,23,0.04)",
              border: "1px solid rgba(18,30,23,0.09)",
              color: "var(--color-darkest)",
              fontFamily: "var(--font-sans-light)",
            }}
          >
            {s}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  // Fetch session
  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setUser(d.user))
      .catch(() => {});
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }, [input]);

  async function send(content: string) {
    const trimmed = content.trim();
    if (!trimmed || loading) return;

    const userMessage: Message = { role: "user", content: trimmed };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) throw new Error(data.error || "خطأ");

      setMessages((cur) => [
        ...cur,
        { role: "assistant", content: data.message },
      ]);
    } catch {
      setMessages((cur) => [
        ...cur,
        {
          role: "assistant",
          content: "عذرًا، حدث خطأ أثناء معالجة السؤال. حاول مرة أخرى.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    window.location.href = "/";
  };

  return (
    <main
      dir="rtl"
      className="flex flex-col h-dvh w-screen overflow-hidden"
      style={{
        backgroundColor: "var(--color-cream)",
        color: "var(--color-darkest)",
      }}
    >
      {/* ── Ambient glow (matches HomeScreen) ── */}
      <div
        className="absolute -top-20 left-1/2 -translate-x-1/2 w-[120%] h-48 rounded-full blur-3xl pointer-events-none opacity-20 z-0"
        style={{
          background:
            "radial-gradient(ellipse at top, var(--color-forest) 0%, transparent 75%)",
        }}
      />

      {/* ── Top Navbar ── */}
      <div className="relative z-30 px-6 pt-6">
        {user ? (
          <TopNavbar user={user} onLogout={handleLogout} />
        ) : (
          /* Minimal header while session loads */
          <div className="flex items-center justify-between mb-6">
            <a href="/">
              <img
                src="/Logo.svg"
                alt="Logo"
                className="w-14 h-14 object-contain"
              />
            </a>
          </div>
        )}
      </div>

      {/* ── Back button + page title ── */}
      <div
        className="relative z-10 flex items-center gap-3 px-6 pb-3"
        style={{ borderBottom: "1px solid rgba(18,30,23,0.06)" }}
      >
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => router.back()}
          className="flex items-center justify-center w-8 h-8 rounded-full"
          style={{
            backgroundColor: "rgba(18,30,23,0.05)",
            color: "var(--color-darkest)",
          }}
        >
          <FiArrowRight size={16} />
        </motion.button>

        <div>
          <p
            className="text-sm leading-tight"
            style={{
              fontFamily: "var(--font-sans-medium)",
              color: "var(--color-darkest)",
            }}
          >
            المساعد التاريخي
          </p>
          <p
            className="text-xs"
            style={{
              fontFamily: "var(--font-sans-light)",
              color: "rgba(18,30,23,0.45)",
            }}
          >
            التاريخ الإسلامي المعاصر
          </p>
        </div>
      </div>

      {/* ── Messages area ── */}
      <section className="relative z-10 flex-1 overflow-y-auto px-4 py-5">
        {messages.length === 0 && !loading ? (
          <EmptyState onSuggest={(q) => send(q)} />
        ) : (
          <div className="flex flex-col gap-4 max-w-lg mx-auto">
            {messages.map((m, i) => (
              <Bubble key={i} message={m} />
            ))}

            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-end items-end gap-2"
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                    style={{
                      backgroundColor: "var(--color-forest)",
                      color: "var(--color-cream)",
                      fontFamily: "var(--font-sans-medium)",
                    }}
                  >
                    ب
                  </div>
                  <div
                    className="px-4 py-3 rounded-2xl"
                    style={{
                      backgroundColor: "rgba(18,30,23,0.04)",
                      border: "1px solid rgba(18,30,23,0.07)",
                      borderBottomRightRadius: "6px",
                    }}
                  >
                    <TypingDots />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={bottomRef} />
          </div>
        )}
      </section>

      {/* ── Input bar ── */}
      <div
        className="relative z-10 px-4 py-4"
        style={{
          borderTop: "1px solid rgba(18,30,23,0.06)",
          backgroundColor: "var(--color-cream)",
        }}
      >
        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-2 max-w-lg mx-auto"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="اسأل عن حدث، شخصية، أو مرحلة تاريخية..."
            rows={1}
            disabled={loading}
            className="flex-1 resize-none rounded-2xl px-4 py-3 text-sm outline-none transition"
            style={{
              minHeight: "48px",
              maxHeight: "140px",
              backgroundColor: "rgba(18,30,23,0.04)",
              border: "1px solid rgba(18,30,23,0.09)",
              color: "var(--color-darkest)",
              fontFamily: "var(--font-sans-light)",
            }}
          />

          <motion.button
            whileTap={{ scale: 0.92 }}
            type="submit"
            disabled={!input.trim() || loading}
            className="flex items-center justify-center w-12 h-12 rounded-2xl flex-shrink-0 transition-opacity"
            style={{
              backgroundColor: "var(--color-forest)",
              color: "var(--color-cream)",
              opacity: !input.trim() || loading ? 0.4 : 1,
            }}
          >
            <FiSend size={17} />
          </motion.button>
        </form>

        <p
          className="text-center text-xs mt-2 max-w-lg mx-auto"
          style={{
            fontFamily: "var(--font-sans-light)",
            color: "rgba(18,30,23,0.35)",
          }}
        >
          النموذج مازال تحت التدريب.{" "}
        </p>
      </div>
    </main>
  );
}
