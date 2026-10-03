import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { ConceptState } from "../types";
import { logEvent } from "../lib/api";

interface Props {
  concept: ConceptState;
  pool: ConceptState[];
  onClose: () => void;
  onComplete: (result: { correct: boolean; rating: string; responseTimeMs: number }) => void;
}

export default function QuizPanel({ concept, pool, onClose, onComplete }: Props) {
  const [started] = useState(() => performance.now());
  const [picked, setPicked] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const options = useMemo(() => {
    const distractors = pool
      .filter((c) => c.id !== concept.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((c) => c.definition);
    const all = [...distractors, concept.definition].sort(() => Math.random() - 0.5);
    return all;
  }, [concept, pool]);

  const submit = async (rating: string, correct: boolean) => {
    const responseTimeMs = performance.now() - started;
    setSubmitted(true);
    await logEvent({
      concept_id: concept.id,
      correct,
      rating,
      response_time_ms: responseTimeMs,
    });
    onComplete({ correct, rating, responseTimeMs });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass absolute bottom-4 left-4 right-4 z-20 mx-auto max-w-xl rounded-2xl p-5 md:left-auto md:right-6 md:bottom-6"
    >
      <div className="mb-1 text-xs uppercase tracking-widest text-amber-glow">Recall checkpoint</div>
      <h3 className="font-display text-xl text-white">{concept.title}</h3>
      <p className="mt-2 text-sm text-slate-300">{concept.mnemonic}</p>

      <p className="mt-4 text-sm font-medium text-slate-200">Which definition matches this concept?</p>
      <div className="mt-3 space-y-2">
        {options.map((opt) => {
          const isCorrect = opt === concept.definition;
          const show = submitted && picked === opt;
          return (
            <button
              key={opt}
              type="button"
              disabled={submitted}
              onClick={() => {
                setPicked(opt);
                void submit(isCorrect ? "good" : "again", isCorrect);
              }}
              className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                show
                  ? isCorrect
                    ? "border-mint-glow/50 bg-mint-glow/10"
                    : "border-red-400/50 bg-red-400/10"
                  : "border-white/10 hover:border-amber-glow/40 hover:bg-white/5"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-3 py-1.5 text-sm text-slate-400 hover:text-white"
        >
          Close
        </button>
      </div>
    </motion.div>
  );
}
