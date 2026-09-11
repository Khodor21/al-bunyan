"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { HiOutlineBookOpen } from "react-icons/hi2";
import { PiDownloadSimple, PiCheckFat } from "react-icons/pi";

// ── Content ────────────────────────────────────────────────
const ARTICLE = {
  id: "1-1",
  trackId: "1",
  title: "العلمانية — المفهوم والمصطلح",
  type: "مقرر مقروء" as const,
  pdfPath: "/tracks/Track One/المسار التأسيسي - 1.pdf",
  readingMinutes: 3,
  sections: [
    {
      id: "s1",
      body: `لفظ العلمانية ترجمة خاطئة لكلمة (secularism) في الإنجليزية، أو (secularity) بالفرنسية، وهي كلمة لا صلة لها بلفظ "العلم" ومشتقاته على الإطلاق. فالعلم في الإنجليزية والفرنسية معناه (science)، والمذهب العلمي نطلق عليه (scientism)، والنسبة إلى العلم هي (scientific) أو (scientifique) في الفرنسية.`,
    },
    {
      id: "s2",
      body: `ثم إن زيادة الألف والنون غير قياسية في اللغة العربية في الاسم المنسوب، وإنما جاءت سماعاً ثم كثرت في كلام المتأخرين، كقولهم: (روحاني، وجسماني، ونوراني...).`,
    },
    {
      id: "s3",
      heading: "الترجمة الصحيحة",
      body: `والترجمة الصحيحة للكلمة هي اللادينية أو الدنيوية، لا بمعنى ما يقابل الأخروية فحسب، بل بمعنى أخص، هو ما لا صلة له بالدين، أو ما كانت علاقته بالدين علاقة تضاد. وتتضح الترجمة الصحيحة من التعريف الذي تورده المعاجم ودوائر المعارف الأجنبية للكلمة.`,
    },
    {
      id: "s4",
      heading: "دائرة المعارف البريطانية",
      body: `تقول دائرة المعارف البريطانية، مادة (secularism): "هي حركة اجتماعية تهدف إلى صرف الناس وتوجيههم من الاهتمام بالآخرة إلى الاهتمام بهذه الدنيا وحدها". ذلك أنه كان لدى الناس في العصور الوسطى رغبة شديدة في العزوف عن الدنيا والتأمل في الله واليوم الآخر. وفي مقاومة هذه الرغبة، طفقت الـ(secularism) تعرض نفسها من خلال تنمية النزعة الإنسانية، حيث بدأ الناس في عصر النهضة يظهرون تعلقهم الشديد بالإنجازات الثقافية والبشرية، وبإمكانية تحقيق مطامحهم في هذه الدنيا القريبة. وظل الاتجاه إلى الـ(secularism) يتطور باستمرار خلال التاريخ الحديث كله، باعتبارها حركة مضادة للدين ومضادة للمسيحية.`,
    },
    {
      id: "s5",
      heading: "قاموس ويبستر",
      body: `يقول قاموس العالم الجديد لويبستر، شرحاً للمادة نفسها: الروح الدنيوية، أو الاتجاهات الدنيوية، ونحو ذلك، وعلى الخصوص: نظام من المبادئ والتطبيقات (practices) يرفض أي شكل من أشكال الإيمان والعبادة. والاعتقاد بأن الدين والشؤون الكنسية لا دخل لها في شؤون الدولة، وخاصة التربية العامة.`,
    },
    {
      id: "s6",
      heading: "معجم أكسفورد",
      body: `يقول معجم أكسفورد، شرحاً لكلمة (secular): دنيوي، أو مادي، ليس دينياً ولا روحياً؛ مثل التربية اللادينية، والفن أو الموسيقى اللادينية، والسلطة اللادينية، والحكومة المناقضة للكنيسة. والرأي الذي يقول إنه لا ينبغي أن يكون الدين أساساً للأخلاق والتربية.`,
    },
    {
      id: "s7",
      heading: "المعجم الدولي الثالث الجديد",
      body: `يقول المعجم الدولي الثالث الجديد، مادة (secularism): "اتجاه في الحياة أو في أي شأن خاص يقوم على مبدأ أن الدين أو الاعتبارات الدينية يجب ألا تتدخل في الحكومة، أو استبعاد هذه الاعتبارات استبعاداً مقصوداً". وهي نظام اجتماعي في الأخلاق مؤسس على فكرة وجوب قيام القيم السلوكية والخلقية على اعتبارات الحياة المعاصرة والتضامن الاجتماعي، دون النظر إلى الدين.`,
    },
    {
      id: "s8",
      heading: "المستشرق أربري",
      body: `يقول المستشرق أربري في كتابه "الدين في الشرق الأوسط" عن الكلمة نفسها: "إن المادية العلمية والإنسانية والمذهب الطبيعي والوضعية كلها أشكال للادينية، واللادينية صفة مميزة لأوروبا وأمريكا. ومع أن مظاهرها موجودة في الشرق الأوسط، فإنها لم تتخذ أي صيغة فلسفية أو أدبية محددة، والنموذج الرئيسي لها هو فصل الدين عن الدولة في الجمهورية التركية".`,
    },
    {
      id: "s9",
      heading: "المدلول الصحيح",
      body: `والتعبير الشائع في الكتب الإسلامية المعاصرة هو "فصل الدين عن الدولة"، وهو في الحقيقة لا يعطي المدلول الكامل للعلمانية، الذي ينطبق على الأفراد وعلى السلوك الذي قد لا يكون له صلة بالدولة. ولو قيل: "فصل الدين عن الحياة" لكان أصوب. ولذلك فإن المدلول الصحيح للعلمانية هو إقامة الحياة على غير الدين، سواء بالنسبة للأمة أو للفرد.`,
    },
    {
      id: "s10",
      heading: "العلمانية المعتدلة والمتطرفة",
      body: `تختلف الدول أو الأفراد في موقفها من الدين بمفهومه الضيق المحدود؛ فبعضها تسمح به، كالمجتمعات الديمقراطية الليبرالية، وتسمي منهجها (العلمانية المعتدلة - non religious)، أي أنها مجتمعات لادينية ولكنها غير معادية للدين. وذلك مقابل ما يسمى (العلمانية المتطرفة - antireligious)، أي المضادة للدين، ويعنون بها المجتمعات الشيوعية وما شاكلها. وبديهي أنه بالنسبة للإسلام لا فرق بين المسميين، فكل ما ليس دينياً من المبادئ والتطبيقات فهو في حقيقته مضاد للدين، فالإسلام واللادينية نقيضان لا يجتمعان، ولا واسطة بينهما.`,
    },
  ],
};

// ── Helpers ────────────────────────────────────────────────
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
export default function ContentPage() {
  const router = useRouter();
  const articleRef = useRef<HTMLDivElement>(null!);
  const { progress, completed } = useScrollProgress(articleRef);
  const [marked, setMarked] = useState(false);

  const circumference = 2 * Math.PI * 11; // r=11

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
      {/* Sticky top bar */}
      <div
        className="sticky top-0 z-30 w-full"
        style={{
          backgroundColor: "var(--color-cream)",
          borderBottom: "1px solid rgba(18,30,23,0.06)",
        }}
      >
        {/* Thin progress line */}
        <motion.div
          className="absolute bottom-0 right-0 h-[2px] origin-right"
          style={{
            backgroundColor: "var(--color-forest)",
            width: `${progress * 100}%`,
            right: "auto",
            left: 0,
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

          {/* Type badge */}
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px]"
            style={{
              fontFamily: "var(--font-sans-light)",
              backgroundColor: "rgba(60,100,70,0.10)",
              color: "var(--color-darkest)",
            }}
          >
            <HiOutlineBookOpen size={12} />
            {ARTICLE.type}
          </span>

          {/* Circular progress */}
          <div className="relative w-8 h-8 flex items-center justify-center">
            <svg width="32" height="32" className="-rotate-90">
              <circle
                cx="16"
                cy="16"
                r="11"
                fill="none"
                stroke="rgba(18,30,23,0.08)"
                strokeWidth="2"
              />
              <circle
                cx="16"
                cy="16"
                r="11"
                fill="none"
                stroke="var(--color-forest)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress)}
                style={{ transition: "stroke-dashoffset 0.15s linear" }}
              />
            </svg>
            <span
              className="absolute text-[8px]"
              style={{
                fontFamily: "var(--font-sans-medium)",
                color: "var(--color-forest)",
              }}
            >
              {Math.round(progress * 100)}
            </span>
          </div>
        </div>
      </div>

      {/* Article */}
      <main className="flex-1 px-6 pt-8 pb-44 max-w-md w-full mx-auto z-10">
        {/* Title */}
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
            {ARTICLE.title}
          </h1>
          <span
            className="text-xs opacity-40"
            style={{ fontFamily: "var(--font-sans-light)" }}
          >
            {ARTICLE.readingMinutes} دقائق للقراءة
          </span>
        </motion.div>

        {/* Sections */}
        <div className="flex flex-col gap-6">
          {ARTICLE.sections.map((section, idx) => (
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
                className="text-sm leading-loose"
                style={{
                  fontFamily: "var(--font-sans-light)",
                  opacity: 0.82,
                  lineHeight: "2",
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
          {/* PDF download — always visible */}
          <motion.a
            href={ARTICLE.pdfPath}
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

          {/* Complete button — appears when near end */}
          <AnimatePresence>
            {completed && (
              <motion.button
                key="complete"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => {
                  setMarked(true);
                  // TODO: call your API here to mark as complete
                  // e.g. markContentComplete(ARTICLE.id)
                  setTimeout(() => router.back(), 1200);
                }}
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
