"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";

interface Quote {
  text: string;
  author: string;
}

const quotes: Quote[] = [
  {
    text: "قليل هم الذين يحملون المبادئ، وقليل من هذا القليل الذين ينفرون من الدنيا من أجل تبليغ هذه المبادئ.",
    author: "عبدالله عزام",
  },
  {
    text: "إن مقادير الرجال تبرز عند اشتداد الأزمات، وإن عظائم الأمور لا يقدر عليها إلا عظام الرجال.",
    author: "عبدالله عزام",
  },
  {
    text: "إن تاريخ الأمم لا يكتب إلا بمداد من دماء الشهداء وعرق المخلصين.",
    author: "عبدالله عزام",
  },
];

interface QuotesViewProps {
  onClose: () => void;
}

export default function QuotesView({ onClose }: QuotesViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Touch tracking refs — no re-renders needed
  const touchStartY = useRef<number>(0);
  const isScrolling = useRef<boolean>(false);

  const scrollToIndex = useCallback((index: number) => {
    const el = containerRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(index, quotes.length - 1));
    el.scrollTo({ top: clamped * el.clientHeight, behavior: "smooth" });
    setCurrentIndex(clamped);
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (isScrolling.current) return;

      const delta = touchStartY.current - e.changedTouches[0].clientY;
      const THRESHOLD = 30; // px — ignore tiny taps

      if (Math.abs(delta) < THRESHOLD) return;

      isScrolling.current = true;
      const direction = delta > 0 ? 1 : -1;
      scrollToIndex(currentIndex + direction);

      // Lock until animation settles (~400 ms matches smooth scroll)
      setTimeout(() => {
        isScrolling.current = false;
      }, 420);
    },
    [currentIndex, scrollToIndex],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Passive false on touchstart so we can call preventDefault if needed
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchEnd]);

  // Disable native scroll entirely — we drive position ourselves
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const preventScroll = (e: Event) => e.preventDefault();
    el.addEventListener("scroll", preventScroll, { passive: false });

    return () => {
      el.removeEventListener("scroll", preventScroll);
    };
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: "100%" }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{ backgroundColor: "var(--color-cream)" }}
      dir="rtl"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between p-6 z-10"
      >
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onClose}
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
          src="/titles/Quotes-Title.svg"
          alt="اقتباسات"
          draggable={false}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          className="h-7"
        />

        <div className="w-10" />
      </motion.div>

      {/* Quotes container — overflow hidden, we scroll it manually */}
      <div
        ref={containerRef}
        className="flex-1 w-full overflow-hidden relative touch-none"
      >
        {quotes.map((quote, index) => (
          <motion.div
            key={index}
            className="absolute inset-x-0 w-full h-full flex flex-col items-center justify-center px-8"
            style={{ top: `${index * 100}%` }}
            animate={{
              y: `${(index - currentIndex) * 100}%`,
              opacity: index === currentIndex ? 1 : 0.3,
            }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
              animate={
                index === currentIndex
                  ? { opacity: 1, scale: 1, filter: "blur(0px)" }
                  : { opacity: 0.3, scale: 0.97, filter: "blur(2px)" }
              }
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-md w-full flex flex-col items-center gap-6"
            >
              <h2
                className="text-2xl md:text-3xl text-center font-medium"
                style={{ color: "var(--color-darkest)" }}
              >
                {quote.text}
              </h2>

              <div
                className="text-sm opacity-60 flex items-center gap-2"
                style={{
                  fontFamily: "var(--font-sans-medium)",
                  color: "var(--color-darkest)",
                }}
              >
                <div className="w-4 h-[1px] bg-current opacity-50" />
                <span>{quote.author}</span>
                <div className="w-4 h-[1px] bg-current opacity-50" />
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Bottom UI */}
      <div className="absolute bottom-8 left-0 right-0 z-10 flex flex-col items-center gap-3 pointer-events-none">
        <motion.span
          key={currentIndex}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 0.4, y: 0 }}
          className="text-[11px] tracking-widest font-mono"
          style={{ color: "var(--color-darkest)" }}
        >
          {formatNumber(currentIndex + 1)}/{formatNumber(quotes.length)}
        </motion.span>

        <div
          className="px-6 py-2.5 rounded-2xl border text-xs shadow-sm backdrop-blur-md"
          style={{
            backgroundColor: "rgba(18,30,23,0.03)",
            borderColor: "rgba(18,30,23,0.06)",
            color: "var(--color-darkest)",
            fontFamily: "var(--font-sans-medium)",
          }}
        >
          اقتباسات
        </div>
      </div>
    </motion.div>
  );
}
