"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import TopBar from "@/components/TopBar";

const ease = [0.16, 1, 0.3, 1] as const;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-3 mb-5">
      <span className="w-7 h-px bg-kanah-accent" />
      <span className="font-display text-[22px] font-bold text-kanah-text leading-none">
        {children}
      </span>
    </p>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ ease, duration: 0.55 }}
    >
      {children}
    </motion.div>
  );
}

export interface StoryReaderProps {
  topKicker: string;
  topTitle: string;
  readingTime: string;
  heroKicker: string;
  heroWord: string;
  heroTitle: string;
  heroSubtitle: string;
  story: string;
  hiddenMeaning: string;
  lifeImpact: string;
  impactLabel: string;
  reflectionQuestion: string;
  dailyAction: string;
  isCompleted: boolean;
  completedLabel: string;
  completing: boolean;
  onComplete: () => void;
}

export default function StoryReader({
  topKicker,
  topTitle,
  readingTime,
  heroKicker,
  heroWord,
  heroTitle,
  heroSubtitle,
  story,
  hiddenMeaning,
  lifeImpact,
  impactLabel,
  reflectionQuestion,
  dailyAction,
  isCompleted,
  completedLabel,
  completing,
  onComplete,
}: StoryReaderProps) {
  const [actionSeen, setActionSeen] = useState(false);
  const actionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    restDelta: 0.001,
  });

  useEffect(() => {
    if (isCompleted) {
      setActionSeen(true);
      return;
    }
    const el = actionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setActionSeen(true);
      },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [isCompleted]);

  return (
    <main className="flex flex-col min-h-screen relative">
      <TopBar kicker={topKicker} title={topTitle} readingTime={readingTime} />
      {/* reading progress */}
      <motion.div
        style={{ scaleX: progress }}
        className="fixed top-0 inset-x-0 h-[2.5px] bg-kanah-accent origin-right z-50 max-w-md mx-auto"
      />

      <div className="flex-1 px-6 pb-40 relative z-10">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease, duration: 0.65 }}
          className="pt-14 pb-12 text-center"
        >
          <p className="text-[11px] text-kanah-accent tracking-[0.2em] font-semibold mb-8">
            {heroKicker}
          </p>
          <p className="font-display text-[60px] leading-[1.15] text-kanah-text mb-6">
            {heroWord}
          </p>
          <h1 className="text-[24px] font-bold text-kanah-text leading-[1.6] mb-3">
            {heroTitle}
          </h1>
          <p className="text-[15px] text-kanah-muted leading-[1.9]">
            {heroSubtitle}
          </p>
        </motion.div>

        <Section>
          <section className="mb-14">
            <SectionLabel>القصة</SectionLabel>
            <p className="text-[17.5px] leading-[2.15] text-kanah-text whitespace-pre-line">
              {story}
            </p>
          </section>
        </Section>

        <Section>
          <section className="mb-14">
            <SectionLabel>المعنى الخفي</SectionLabel>
            <p className="text-[17.5px] leading-[2.15] text-kanah-text whitespace-pre-line">
              {hiddenMeaning}
            </p>
          </section>
        </Section>

        <Section>
          <section className="mb-14">
            <SectionLabel>{impactLabel}</SectionLabel>
            <p className="text-[17.5px] leading-[2.15] text-kanah-text whitespace-pre-line">
              {lifeImpact}
            </p>
          </section>
        </Section>

        <Section>
          <section className="mb-8">
            <div className="rounded-[24px] bg-kanah-accent-subtle border border-kanah-accent/30 p-7">
              <p className="text-[11px] font-bold text-kanah-accent tracking-[0.18em] mb-4">
                سؤال محاسبة
              </p>
              <p className="font-display text-[24px] leading-[1.7] text-kanah-text">
                {reflectionQuestion}
              </p>
            </div>
          </section>
        </Section>

        <Section>
          <section ref={actionRef}>
            <div className="rounded-[24px] bg-kanah-midnight p-7">
              <p className="text-[11px] font-bold text-kanah-accent tracking-[0.18em] mb-4">
                عمل اليوم
              </p>
              <p className="font-display text-[21px] leading-[1.8] text-kanah-on-midnight whitespace-pre-line">
                {dailyAction}
              </p>
            </div>
          </section>
        </Section>
      </div>

      <div className="fixed bottom-0 inset-x-0 max-w-md mx-auto p-4 pb-6 bg-kanah-veil backdrop-blur-md z-40">
        {isCompleted ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2 py-3 text-kanah-completed font-medium text-[15px]"
          >
            <CheckCircle2 size={18} />
            <span>{completedLabel}</span>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.button
              key={actionSeen ? "active" : "inactive"}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ease, duration: 0.35 }}
              onClick={onComplete}
              disabled={!actionSeen || completing}
              whileTap={actionSeen ? { scale: 0.97 } : {}}
              className={`w-full py-4 rounded-full text-[16px] font-semibold disabled:cursor-default transition-colors flex items-center justify-center gap-2.5 ${
                actionSeen
                  ? "bg-kanah-text text-kanah-card shadow-soft"
                  : "bg-kanah-surface text-kanah-locked"
              }`}
            >
              {actionSeen && (
                <span className="w-1.5 h-1.5 rounded-full bg-kanah-accent" />
              )}
              أتممت عمل اليوم
            </motion.button>
          </AnimatePresence>
        )}
      </div>
    </main>
  );
}

export function DailyRestNotice({
  title,
  body,
  extra,
}: {
  title: string;
  body: string;
  extra?: string;
}) {
  return (
    <main className="flex flex-col min-h-screen relative">
      <TopBar />
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-7 relative z-10">
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 18, stiffness: 280 }}
          className="font-display text-[52px] text-kanah-accent block leading-none"
        >
          ✦
        </motion.span>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease, duration: 0.45, delay: 0.2 }}
        >
          <p className="font-display text-[26px] font-bold text-kanah-text mb-4">
            {title}
          </p>
          <p className="text-[15.5px] text-kanah-muted leading-[2]">{body}</p>
          {extra && (
            <p className="text-[14px] text-kanah-accent leading-[1.9] mt-4">
              {extra}
            </p>
          )}
        </motion.div>
      </div>
    </main>
  );
}
