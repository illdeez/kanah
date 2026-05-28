"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, ChevronRight, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getStory, getStoryStatus, getTrack, isWordTrack, toArabicNumeral } from "@/data/days";
import {
  completeStory,
  getTodayTrackRead,
  getUserData,
  isDevMode,
  isDevUnlimited,
  UserData,
} from "@/lib/storage";

const ease = [0.16, 1, 0.3, 1] as const;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold text-kanah-accent-muted tracking-[0.2em] uppercase mb-5">
      {children}
    </p>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 my-12">
      <div className="flex-1 h-px bg-kanah-border" />
      <span className="text-[10px] text-kanah-locked select-none">✦</span>
      <div className="flex-1 h-px bg-kanah-border" />
    </div>
  );
}

function Section({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ ease, duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
}

export default function StoryPage() {
  const params = useParams();
  const router = useRouter();
  const trackId = String(params.trackId);
  const storyId = Number(params.storyId);

  const [userData, setUserData] = useState<UserData | null>(null);
  const [devMode, setDevMode] = useState(false);
  const [devUnlimited, setDevUnlimited] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [actionSeen, setActionSeen] = useState(false);
  const actionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setUserData(getUserData());
    setDevMode(isDevMode());
    setDevUnlimited(isDevUnlimited());
  }, [trackId]);

  const track = getTrack(trackId);
  const story = getStory(trackId, storyId);
  const isCompleted = userData
    ? (userData.completedStoriesByTrack[trackId] ?? []).includes(storyId)
    : false;
  const todayTrackRead = userData ? getTodayTrackRead(userData, trackId) : null;
  const blockedByDaily =
    !devUnlimited &&
    !isCompleted &&
    !!todayTrackRead &&
    !(todayTrackRead.itemType !== "name" && todayTrackRead.storyId === storyId);

  useEffect(() => {
    if (!userData) return;
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
  }, [userData, isCompleted]);

  useEffect(() => {
    if (!track || !story) router.replace("/library");
  }, [track, story, router]);

  if (!userData || !track || !story) return null;

  const status = getStoryStatus(
    trackId,
    storyId,
    userData.completedStoriesByTrack,
    devMode
  );

  if (status === "locked") {
    router.replace(`/tracks/${trackId}`);
    return null;
  }

  if (blockedByDaily) {
    return (
      <main className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 bg-kanah-bg/95 backdrop-blur-sm border-b border-kanah-border">
          <div className="flex items-center gap-3 px-4 h-14">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-kanah-border transition-colors"
              aria-label="رجوع"
            >
              <ChevronRight size={20} className="text-kanah-muted" />
            </button>
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 18, stiffness: 280 }}
            className="text-[48px] text-kanah-accent-muted block"
          >
            ✦
          </motion.span>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease, duration: 0.45, delay: 0.2 }}
          >
            <p className="text-[22px] font-bold text-kanah-text mb-3">
              خذ وقتك مع معنى اليوم
            </p>
            <p className="text-[16px] text-kanah-muted leading-[2]">
              خذ وقتك مع معنى اليوم… القصة التالية في هذا المسار تُفتح غداً.
            </p>
          </motion.div>
        </div>
      </main>
    );
  }

  function handleComplete() {
    setCompleting(true);
    completeStory(trackId, storyId);
    router.push(`/tracks/${trackId}/stories/${storyId}/complete`);
  }

  return (
    <main className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 bg-kanah-bg/95 backdrop-blur-sm border-b border-kanah-border">
        <div className="flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-kanah-border transition-colors"
            aria-label="رجوع"
          >
            <ChevronRight size={20} className="text-kanah-muted" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-kanah-locked tracking-widest uppercase">
              {track.word} · القصة {toArabicNumeral(story.storyNumber)}
            </p>
            <p className="text-[13px] font-semibold text-kanah-text truncate leading-tight">
              {story.title}
            </p>
          </div>
          <div className="flex items-center gap-1 text-kanah-locked text-[11px] flex-shrink-0">
            <Clock size={11} />
            <span>{story.readingTime}</span>
          </div>
        </div>
      </header>

      <div className="flex-1 px-6 pb-36">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease, duration: 0.6 }}
          className="pt-12 pb-10"
        >
          <p className="text-[10px] text-kanah-locked tracking-widest uppercase mb-5">
            {track.word} · القصة {toArabicNumeral(story.storyNumber)} من{" "}
            {toArabicNumeral(isWordTrack(track) ? track.totalStories : 0)}
          </p>
          <h1 className="text-[42px] font-extrabold text-kanah-accent leading-tight mb-4 tracking-tight">
            {story.title}
          </h1>
          <p className="text-[19px] text-kanah-muted font-light leading-relaxed">
            {track.subtitle}
          </p>
        </motion.div>

        <Divider />

        <Section>
          <section className="mb-12">
            <SectionLabel>الكلمة</SectionLabel>
            <p className="text-[24px] font-bold text-kanah-text">{track.word}</p>
          </section>
        </Section>

        <Divider />

        <Section>
          <section className="mb-12">
            <SectionLabel>القصة</SectionLabel>
            <p className="text-[17px] leading-[2.1] text-kanah-text whitespace-pre-line">
              {story.story}
            </p>
          </section>
        </Section>

        <Divider />

        <Section>
          <section className="mb-12">
            <SectionLabel>المعنى الخفي</SectionLabel>
            <p className="text-[17px] leading-[2.1] text-kanah-text whitespace-pre-line">
              {story.hiddenMeaning}
            </p>
          </section>
        </Section>

        <Divider />

        <Section>
          <section className="mb-12">
            <SectionLabel>أثرها في حياتك</SectionLabel>
            <p className="text-[17px] leading-[2.1] text-kanah-text whitespace-pre-line">
              {story.lifeImpact}
            </p>
          </section>
        </Section>

        <Divider />

        <Section>
          <section className="mb-12">
            <div className="bg-kanah-surface rounded-2xl p-6 border border-kanah-border">
              <SectionLabel>سؤال محاسبة</SectionLabel>
              <p className="text-[18px] leading-[2] text-kanah-text font-medium">
                {story.reflectionQuestion}
              </p>
            </div>
          </section>
        </Section>

        <Section>
          <section ref={actionRef}>
            <div className="bg-kanah-accent-subtle rounded-2xl p-6">
              <SectionLabel>عمل اليوم</SectionLabel>
              <p className="text-[17px] leading-[2.1] text-kanah-text whitespace-pre-line">
                {story.dailyAction}
              </p>
            </div>
          </section>
        </Section>
      </div>

      <div className="fixed bottom-0 inset-x-0 max-w-md mx-auto p-4 bg-kanah-bg/95 backdrop-blur-sm border-t border-kanah-border">
        {isCompleted ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2 py-3 text-kanah-completed font-medium text-[15px]"
          >
            <CheckCircle2 size={18} />
            <span>أتممت هذه القصة بالفعل</span>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.button
              key={actionSeen ? "active" : "inactive"}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ease, duration: 0.35 }}
              onClick={handleComplete}
              disabled={!actionSeen || completing}
              whileTap={actionSeen ? { scale: 0.97 } : {}}
              className={`w-full py-4 rounded-2xl text-[17px] font-bold disabled:cursor-default ${
                actionSeen
                  ? "bg-kanah-accent text-white shadow-accent"
                  : "bg-kanah-border text-kanah-locked opacity-70"
              }`}
            >
              أتممت عمل اليوم
            </motion.button>
          </AnimatePresence>
        )}
      </div>
    </main>
  );
}
