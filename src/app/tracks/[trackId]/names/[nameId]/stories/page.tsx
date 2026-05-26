"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, ChevronRight, Clock, Lock } from "lucide-react";
import { motion } from "framer-motion";

import { getName, getNamesTrack, toArabicNumeral } from "@/data/days";
import {
  getUserData,
  isDevMode,
  setActiveTrack,
  UserData,
} from "@/lib/storage";
import BottomNav from "@/components/BottomNav";

const ease = [0.16, 1, 0.3, 1] as const;
const listContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const listItem = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { ease, duration: 0.4 } },
};

export default function NameStoriesPage() {
  const params = useParams();
  const router = useRouter();
  const trackId = String(params.trackId);
  const nameId = String(params.nameId);

  const [userData, setUserData] = useState<UserData | null>(null);
  const [devMode, setDevMode] = useState(false);

  useEffect(() => {
    const data = getUserData();
    setUserData(data);
    setDevMode(isDevMode());
    setActiveTrack(trackId);
  }, [trackId]);

  const track = getNamesTrack(trackId);
  const name = getName(trackId, nameId);

  useEffect(() => {
    if (!track || !name) router.replace(`/tracks/${trackId}/names`);
    if (name && (!name.stories || name.stories.length === 0)) {
      router.replace(`/tracks/${trackId}/names/${nameId}`);
    }
  }, [track, name, trackId, nameId, router]);

  if (!userData || !track || !name) return null;
  if (!name.stories || name.stories.length === 0) return null;

  const completedStoryIds =
    userData.completedNameStoriesByTrack?.[trackId]?.[nameId] ?? [];
  const progress = completedStoryIds.length;
  const total = name.stories.length;

  // Find next available story (first not completed)
  const nextStory = name.stories.find((s) => !completedStoryIds.includes(s.id));

  return (
    <main className="flex flex-col min-h-screen pb-24" dir="rtl">
      {/* Header */}
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
              أسماء الله الحسنى
            </p>
            <p className="text-[13px] font-semibold text-kanah-text truncate leading-tight">
              {name.name} · رحلة ١٠ أيام
            </p>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 pt-10 pb-8">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease, duration: 0.45 }}
          className="text-[11px] font-semibold text-kanah-accent-muted tracking-widest uppercase mb-3"
        >
          رحلة الاسم
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease, duration: 0.5 }}
          className="text-[52px] font-extrabold text-kanah-accent leading-tight mb-3"
        >
          {name.name}
        </motion.h1>
        <p className="text-[16px] text-kanah-text leading-[2] mb-3">
          {name.title}
        </p>

        <div className="bg-kanah-card border border-kanah-border rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-kanah-locked">التقدّم</span>
            <span className="text-[14px] font-semibold text-kanah-accent">
              {toArabicNumeral(progress)} من {toArabicNumeral(total)}
            </span>
          </div>
        </div>
      </section>

      {/* CTA button */}
      {nextStory && (
        <section className="px-6 pb-8">
          <Link
            href={`/tracks/${trackId}/names/${nameId}/stories/${nextStory.id}`}
            className="block w-full text-center py-4 rounded-2xl text-[16px] font-semibold bg-kanah-accent text-white shadow-accent active:scale-[0.98]"
          >
            {progress > 0 ? "تابع القصة المتاحة" : "ابدأ هذه الرحلة"}
          </Link>
        </section>
      )}

      {/* Stories list */}
      <section className="px-6 pb-12">
        <h2 className="text-[10px] font-semibold text-kanah-locked tracking-widest uppercase mb-4">
          قصص الرحلة
        </h2>
        <motion.div
          variants={listContainer}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-3"
        >
          {name.stories.map((story) => {
            const isCompleted = completedStoryIds.includes(story.id);
            const isComingSoon = !story.contentReady && !devMode;
            // A story is locked if previous story hasn't been completed yet
            const isLocked =
              !isCompleted &&
              story.storyNumber > 1 &&
              !completedStoryIds.includes(story.id - 1) &&
              !devMode;
            const canOpen = !isComingSoon && !isLocked;

            const card = (
              <motion.div
                variants={listItem}
                whileTap={canOpen ? { scale: 0.985 } : {}}
                className={`rounded-2xl border p-5 transition-colors ${
                  canOpen
                    ? "bg-kanah-card border-kanah-border"
                    : "bg-kanah-card border-kanah-border opacity-50"
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="text-[11px] text-kanah-locked">
                    اليوم {toArabicNumeral(story.storyNumber)}
                  </span>
                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-kanah-completed bg-emerald-50 px-2.5 py-1 rounded-full">
                      <CheckCircle2 size={11} />
                      مكتملة
                    </span>
                  ) : isComingSoon ? (
                    <span className="text-[11px] font-semibold text-kanah-locked bg-kanah-border px-2.5 py-1 rounded-full">
                      قريباً
                    </span>
                  ) : isLocked ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-kanah-locked bg-kanah-border px-2.5 py-1 rounded-full">
                      <Lock size={10} />
                      لم تُفتح بعد
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-kanah-accent bg-kanah-accent-subtle px-2.5 py-1 rounded-full">
                      متاحة
                    </span>
                  )}
                </div>

                <p
                  className={`text-[18px] font-bold leading-[1.7] mb-2 ${
                    canOpen ? "text-kanah-text" : "text-kanah-locked"
                  }`}
                >
                  {story.title}
                </p>

                {canOpen && (
                  <div className="flex items-center gap-1.5 text-kanah-locked text-[11px]">
                    <Clock size={11} />
                    <span>{story.readingTime}</span>
                  </div>
                )}
              </motion.div>
            );

            if (!canOpen) return <div key={story.id}>{card}</div>;

            return (
              <Link
                key={story.id}
                href={`/tracks/${trackId}/names/${nameId}/stories/${story.id}`}
              >
                {card}
              </Link>
            );
          })}
        </motion.div>
      </section>

      <BottomNav />
    </main>
  );
}
