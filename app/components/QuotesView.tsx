"use client";

import { useRef, useState, useEffect, UIEvent } from "react";
import { motion } from "framer-motion";

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

  // Update current index based on scroll position for the counter
  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const scrollPosition = e.currentTarget.scrollTop;
    const viewportHeight = e.currentTarget.clientHeight;
    const newIndex = Math.round(scrollPosition / viewportHeight);
    if (
      newIndex !== currentIndex &&
      newIndex >= 0 &&
      newIndex < quotes.length
    ) {
      setCurrentIndex(newIndex);
    }
  };

  // Format index to "01", "02", etc.
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
      {/* ── Top Bar / Close Button ────────────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-6 pointer-events-none">
        <button
          onClick={onClose}
          className="pointer-events-auto flex items-center justify-center w-10 h-10 rounded-full bg-black/5 hover:bg-black/10 transition-colors backdrop-blur-md text-lg"
          style={{ color: "var(--color-darkest)" }}
        >
          ✕
        </button>
      </div>

      {/* ── Scrollable Quotes Container (Snap Y) ────────────────────────── */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 w-full h-full overflow-y-auto snap-y snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth"
      >
        {quotes.map((quote, index) => (
          <div
            key={index}
            className="w-full h-dvh shrink-0 snap-center flex flex-col items-center justify-center px-8 relative"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              viewport={{ amount: 0.5 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
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
          </div>
        ))}
      </div>

      {/* ── Fixed Bottom UI ─────────────────────────────────────────────── */}
      <div className="absolute bottom-8 left-0 right-0 z-10 flex flex-col items-center gap-3 pointer-events-none">
        {/* Counter */}
        <motion.span
          key={currentIndex}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 0.4, y: 0 }}
          className="text-[11px] tracking-widest font-mono"
          style={{ color: "var(--color-darkest)" }}
        >
          {formatNumber(currentIndex + 1)}/{formatNumber(quotes.length)}
        </motion.span>

        {/* Category Pill */}
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
