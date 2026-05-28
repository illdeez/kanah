"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getStory, getTrack, toArabicNumeral } from "@/data/days";
import { getUserData, savePledge, saveReflection } from "@/lib/storage";

const ease = [0.16, 1, 0.3, 1] as const;

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { ease, duration: 0.45 } },
};

export default function CompleteStoryPage() {
  const params = useParams();
  const router = useRouter();
  const trackId = String(params.trackId);
  const storyId = Number(params.storyId);

  const [selectedLine, setSelectedLine] = useState("");
  const [step, setStep] = useState<"line" | "pledge">("line");
  const [saved, setSaved] = useState(false);

  const track = getTrack(trackId);
  const story = getStory(trackId, storyId);
  const isCompleted = !!getUserData().completedStoriesByTrack[trackId]?.includes(storyId);

  useEffect(() => {
    if (!track || !story || !isCompleted) router.replace(`/tracks/${trackId}`);
  }, [track, story, isCompleted, router, trackId]);

  if (!track || !story || !isCompleted) return null;

  function handleSaveLine() {
    if (!selectedLine) return;
    saveReflection(trackId, storyId, selectedLine);
    setStep("pledge");
  }

  function handleSavePledge() {
    const pledgeText = story?.pledgeText ?? "";
    if (!pledgeText.trim()) {
      setSaved(true);
      setTimeout(() => router.replace(`/tracks/${trackId}`), 1000);
      return;
    }
    savePledge(trackId, storyId, pledgeText);
    setSaved(true);
    setTimeout(() => router.replace("/"), 1000);
  }

  function handleSkip() {
    if (step === "line") {
      router.replace(`/tracks/${trackId}`);
      return;
    }
    setSaved(true);
    setTimeout(() => router.replace("/"), 1000);
  }

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-6 gap-5">
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 18, stiffness: 280, delay: 0.1 }}
          className="text-[44px] text-kanah-accent-muted block"
        >
          ✦
        </motion.span>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease, duration: 0.45, delay: 0.25 }}
        >
          <p className="text-[20px] font-bold text-kanah-text mb-2">حُفظت</p>
          <p className="text-[13px] text-kanah-muted">
            ستجد الجملة التي بقيت فيك وتعهدك في صفحة أثري
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <main className="flex flex-col min-h-screen px-6 pt-14 pb-8">
      {/* Header — animates once on mount */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease, duration: 0.5 }}
        className="pt-8 pb-10"
      >
        <span className="text-[11px] font-semibold text-kanah-completed tracking-widest uppercase block mb-8">
          ✓ أتممت القصة {toArabicNumeral(story.storyNumber)}
        </span>

        <AnimatePresence mode="wait">
          {step === "line" ? (
            <motion.div
              key="line-header"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ ease, duration: 0.35 }}
            >
              <p className="text-[26px] font-bold text-kanah-text leading-snug mb-2">
                اختر الجملة التي بقيت فيك
              </p>
              <p className="text-[14px] text-kanah-muted leading-[1.9]">
                واحفظها في أثرك لتعود إليها لاحقاً.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="pledge-header"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ ease, duration: 0.35 }}
            >
              <p className="text-[26px] font-bold text-kanah-text leading-snug mb-2">
                تعهد اليوم
              </p>
              <p className="text-[14px] text-kanah-muted leading-[1.9]">
                خذ من القصة خطوة صغيرة تحوّل المعنى إلى سلوك.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Content area */}
      <div className="flex-1 flex flex-col gap-3">
        <AnimatePresence mode="wait">
          {step === "line" ? (
            <motion.div
              key="line-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ ease, duration: 0.35 }}
              className="flex flex-col gap-3"
            >
              <p className="text-[12px] text-kanah-muted leading-[1.8]">
                سيُحفَظ اختيارك تحت {track.word} · {story.title}
              </p>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="flex flex-col gap-3"
              >
                {story.selectedLines.map((line) => {
                  const active = selectedLine === line;
                  return (
                    <motion.button
                      key={line}
                      variants={itemVariants}
                      type="button"
                      onClick={() => setSelectedLine(line)}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full text-right rounded-2xl border p-5 transition-colors ${
                        active
                          ? "border-kanah-accent bg-kanah-accent-subtle text-kanah-text"
                          : "border-kanah-border bg-kanah-card text-kanah-text"
                      }`}
                    >
                      <span className="flex items-start gap-3">
                        <span
                          className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                            active
                              ? "border-kanah-accent bg-kanah-accent text-white"
                              : "border-kanah-border bg-white"
                          }`}
                        >
                          {active && <CheckCircle2 size={12} />}
                        </span>
                        <span className="text-[16px] leading-[1.9]">{line}</span>
                      </span>
                    </motion.button>
                  );
                })}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="pledge-content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ ease, duration: 0.4 }}
              className="flex flex-col gap-3"
            >
              <p className="text-[12px] text-kanah-muted leading-[1.8]">
                سيُحفَظ هذا التعهد كتذكير بسلوك اليوم.
              </p>
              <div className="rounded-3xl border border-kanah-accent/15 bg-kanah-accent-subtle p-6">
                <p className="text-[20px] font-bold text-kanah-accent mb-3">
                  {track.word}
                </p>
                <p className="text-[17px] leading-[2] text-kanah-text">
                  {story.pledgeText}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-6">
        <AnimatePresence mode="wait">
          {step === "line" ? (
            <motion.button
              key="save-line"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ ease, duration: 0.3 }}
              onClick={handleSaveLine}
              disabled={!selectedLine}
              whileTap={selectedLine ? { scale: 0.97 } : {}}
              className="w-full bg-kanah-accent text-white py-4 rounded-2xl text-[16px] font-bold shadow-accent disabled:opacity-50 disabled:cursor-default"
            >
              احفظها في أثري
            </motion.button>
          ) : (
            <motion.button
              key="save-pledge"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ ease, duration: 0.3 }}
              onClick={handleSavePledge}
              whileTap={{ scale: 0.97 }}
              className="w-full bg-kanah-accent text-white py-4 rounded-2xl text-[16px] font-bold shadow-accent"
            >
              أتعهد بهذا اليوم
            </motion.button>
          )}
        </AnimatePresence>
        <button
          onClick={handleSkip}
          className="w-full py-3 text-kanah-locked text-[13px] transition-colors hover:text-kanah-muted"
        >
          {step === "line" ? "تخطي الآن" : "لاحقاً"}
        </button>
      </div>
    </main>
  );
}
