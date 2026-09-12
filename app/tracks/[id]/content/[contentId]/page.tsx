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
import { Emoji } from "emoji-picker-react";

// ── Content Database ───────────────────────────────────────
const ARTICLES_DATA = [
  {
    id: "1-1",
    trackId: "1",
    title: "المسار التأسيسي - المفاهيم الفكرية والاقتصادية",
    type: "مقرر مقروء" as const,
    readingMinutes: 2,
    sections: [
      {
        id: "s1",
        body: `مسار تأسيسي يعرّف المتعلم بالمفاهيم الفكرية والاقتصادية الأساسية اللازمة لفهم التاريخ الإسلامي المعاصر.`,
      },
      {
        id: "s2",
        heading: "لماذا المسار التأسيسي؟",
        body: `يوحّد المسار المصطلحات والأفكار الأساسية بين المتعلمين من خلفيات مختلفة، ويزوّدهم بقاعدة معرفية مشتركة، مثل العلمانية والرأسمالية، حتى لا يؤدي نقص المعرفة إلى صعوبة في متابعة المسارات المتقدمة.\n\nكما يمهّد للفهم الشرعي من خلال التعريف المبسط بهذه المفاهيم بعين الشريعة، ليتعرف المتعلم إلى اختلاف المنظور الإسلامي عن النظرات العلمانية أو اليسارية أو الليبرالية، بما يساعده على تحليل الأحداث والمواقف المعاصرة بوعي ديني.\n\nويسهم المسار في خفض التفاوت بين المتعلمين من خلال مسار قصير ومركز يضمن حصول الجميع على الحد الأدنى من المعلومات الضرورية، مما يقلل فجوة المعرفة بين المتعلم المتقدم والجديد.\n\nكما تتيح المعرفة المسبقة بهذه المصطلحات للمتعلم الانتقال إلى المسارات المنهجية الأخرى بسهولة، دون تشتيت الوقت في شرح المفاهيم الأساسية لاحقًا.\n\nوقد صُمم المسار ليكون مرناً ومركزاً، بما يتناسب مع أوقات الفراغ اليومية (30 دقيقة يوميًا)، مع الحفاظ على وضوح الشرح وتركيزه، والتأكيد على البعد الشرعي في مناقشة المفاهيم.`,
      },
      {
        id: "s3",
        heading: "المنهج والمفاهيم الأساسية: العلمانية",
        body: `مبدأ فصل الدين عن الدولة والمؤسسات السياسية، بحيث يُقتصر دور الدين على الجانب الروحي الخاص بالفرد.\n\nأهداف التعلم: فهم أصل العلمانية وتطورها التاريخي؛ التمييز بين العلمانية وفصل الدين المؤقت؛ إدراك موقف الإسلام من دور الدين في الحياة العامة؛ ودراسة أمثلة على تطبيق العلمانية في المجتمع الغربي.\n\nمدة الدرس: وحدة واحدة (30 دقيقة).\n\nمصادر مقترحة: تعريفات مبسطة مثل إسلام ويب، أو مقالات أكاديمية مختصرة.`,
      },
      {
        id: "s4",
        heading: "الرأسمالية",
        body: `نظام اقتصادي يقوم على الملكية الخاصة لوسائل الإنتاج، والسعي إلى تحقيق الربح من خلال سوق حر قائم على المنافسة.\n\nأهداف التعلم: فهم دور الملكية الخاصة في توزيع الثروة؛ إدراك كيفية عمل سوق العرض والطلب؛ تمييز الرأسمالية عن الأنظمة الأخرى، كالاشتراكية والشيوعية؛ والتعرف على مزاياها، مثل الابتكار والازدهار الاقتصادي، وانتقاداتها، مثل عدم المساواة والاستغلال.\n\nمدة الدرس: وحدتان (60 دقيقة).\n\nمصادر مقترحة: موسوعة مختصرة للرأسمالية، أو مقالات مبسطة عن الاقتصاد الحر.`,
      },
      {
        id: "s5",
        heading: "الاشتراكية",
        body: `نظام اقتصادي يقوم على الملكية الجماعية أو العامة لوسائل الإنتاج، ويركز على التعاون والتخطيط المركزي لتوزيع الثروة.\n\nأهداف التعلم: إدراك مفهوم الملكية الجماعية والمساواة الاقتصادية؛ تمييز الاشتراكية عن الرأسمالية، وخاصة في دور الدولة في الاقتصاد؛ فهم أهدافها الاجتماعية، مثل العدالة المعيشية؛ والتعرف بإيجاز على أفكار ماركس والاشتراكية الديمقراطية.\n\nمدة الدرس: وحدة واحدة (30 دقيقة).\n\nمصادر مقترحة: تعريفات مبسطة عن الاشتراكية، أو مناقشات نقدية في الثقافة الإسلامية.`,
      },
      {
        id: "s6",
        heading: "الشيوعية",
        body: `أيديولوجيا يسارية تسعى إلى تحقيق الملكية المشتركة الكاملة لوسائل الإنتاج، وتوزيع الثروة على أساس الحاجة، بهدف إلغاء الفوارق الطبقية.\n\nأهداف التعلم: فهم مفهوم الملكية المشتركة والهدف النهائي للشيوعية؛ تمييز الشيوعية عن الاشتراكية من حيث أبعادها الأيديولوجية؛ مراجعة موجزة لنظرية ماركس والبيان الشيوعي؛ والتعرف على أمثلة تاريخية، مثل الاتحاد السوفيتي والصين.\n\nمدة الدرس: وحدة واحدة (30 دقيقة).\n\nمصادر مقترحة: شرح مبسط للشيوعية، ومقارنات مع الاشتراكية.`,
      },
      {
        id: "s7",
        heading: "القومية",
        body: `أيديولوجيا تعظّم مصلحة أمة أو شعب معين، وتدعو إلى استقلاله والسيادة الوطنية على وطنه.\n\nأهداف التعلم: إدراك معنى الأمة والقومية والثقافة المشتركة؛ فهم فكرة الاستقلال والسيادة الوطنية؛ التمييز بين أنواع القومية، مثل المدنية والإثنية؛ ونقد بعض آثارها السلبية، كالتعصب والانغلاق.\n\nمدة الدرس: وحدة واحدة (30 دقيقة).\n\nمصادر مقترحة: تعريفات مبسطة عن القومية، أو مقالات توضيحية مثل القومية العربية.`,
      },
      {
        id: "s8",
        heading: "الليبرالية",
        body: `فلسفة سياسية واقتصادية تؤكد على الحرية الفردية والمساواة، وتحافظ على دور محدود للدولة في شؤون الأفراد، مع حماية حقوق الإنسان والحريات العامة.\n\nأهداف التعلم: فهم مبادئ الحرية الفردية، مثل حرية التعبير والصحافة والاختيار؛ التعرف على مفهوم الديمقراطية الليبرالية، كالانتخابات وفصل السلطات؛ الاطلاع على الاقتصاد الحر في ظل إشراف حكومي محدود؛ ومناقشة أبرز الإيجابيات، مثل حقوق الإنسان، والانتقادات، مثل عدم التشديد على العدالة الاجتماعية.\n\nمدة الدرس: وحدة واحدة (30 دقيقة).\n\nمصادر مقترحة: مقالات حول الليبرالية، ومواد تفسر الحريات الليبرالية.`,
      },
      {
        id: "s9",
        heading: "هيكل المسار",
        body: `عدد الوحدات وترتيبها:\nيتكون المسار من 7 وحدات، مدة كل منها 30 دقيقة. تبدأ الوحدة الأولى بمقدمة إسلامية تأسيسية تتناول أسس التوحيد والعقيدة كمدخل شرعي للمسار، تليها 6 وحدات تتناول المفاهيم الأساسية بالترتيب: العلمانية، الرأسمالية، الاشتراكية، الشيوعية، القومية، والليبرالية.\n\nالمدة الإجمالية:\n7 وحدات، أي 3.5 ساعات من الدراسة النظرية. ويُنصح بتوزيعها على أسبوعين بمعدل نصف ساعة يوميًا، قبل أو بعد المواصلات مثلاً.`,
      },
      {
        id: "s10",
        heading: "التقييم ومعيار النجاح",
        body: `التقييم:\nفي نهاية المسار، يُجرى اختبار قصير من 5–7 أسئلة اختيار من متعدد، يغطي المفاهيم الرئيسة. ويُحدد معيار نجاح، مثل 70%، لمنح المتعلم الوصول إلى المسارات المتقدمة. ويمكن أيضًا تضمين اختبار مصغر في نهاية كل وحدة للتأكد من الفهم الفوري.\n\nمعيار النجاح:\nاجتياز الاختبار بنسبة 70% أو أكثر.`,
      },
      {
        id: "s11",
        heading: "خطة المعالجة",
        body: `في حال عدم اجتياز الاختبار، يُطلب من المتعلم مراجعة المواد الأساسية، مثل مشاهدة الفيديوهات التوضيحية أو إعادة قراءة الملخصات، ثم إعادة الاختبار بعد فترة قصيرة.\n\nويمكن تخصيص مصادر دعم إضافية، مثل الملخصات أو الشروحات المبسطة، للمفاهيم التي وجد المتعلم صعوبة فيها. والهدف هو ضمان تمكّن المتعلم من المفاهيم الأساسية قبل الانتقال إلى بقية المسارات.`,
      },
    ],
  },
  // You can add ID 2 here later
  {
    id: "1-3",
    trackId: "3",
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
  },
];
const TYPE_CONFIG: Record<string, { unified: string }> = {
  "مقرر مقروء": { unified: "1f4d6" },
  "مقرر مسموع": { unified: "1f3a7" },
  "مقرر مرئي": { unified: "1f3ac" },
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
export default function ContentPage({
  params,
}: {
  params: { id: string; contentId: string };
}) {
  const router = useRouter();
  const articleRef = useRef<HTMLDivElement>(null!);
  const { progress, completed } = useScrollProgress(articleRef);
  const [marked, setMarked] = useState(false);

  // Defaulting to the first article (id: "1") for display purposes.
  // In a real scenario, this would likely be determined by a URL parameter.
  const ARTICLE =
    ARTICLES_DATA.find((a) => a.id === params.contentId) || ARTICLES_DATA[0];
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
          <span
            className="inline-flex items-center gap-1.5  py-1 rounded-full text-sm"
            style={{
              fontFamily: "var(--font-sans-light)",
              color: "var(--color-darkest)",
            }}
          >
            <Emoji
              unified={TYPE_CONFIG[ARTICLE.type]?.unified ?? "1f4d6"}
              size={15}
            />
            {ARTICLE.type}
          </span>
          <div></div>
          {/* Circular progress */}
          {/* <div className="relative w-8 h-8 flex items-center justify-center">
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
          </div> */}
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
                  whiteSpace: "pre-wrap", // This renders \n\n as actual visual breaks
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
          {ARTICLE.pdfPath && (
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
          )}
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
