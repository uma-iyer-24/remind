import { motion } from "framer-motion";
import { Brain, Sparkles } from "lucide-react";
import type { ConceptState } from "../types";

interface Props {
  concept: ConceptState;
  onQuiz: () => void;
  onClose: () => void;
}

export default function ConceptDetail({ concept, onQuiz, onClose }: Props) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass absolute left-4 top-20 z-20 w-full max-w-sm rounded-2xl p-5 md:left-6"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">Memory object</p>
          <h2 className="font-display text-2xl text-white">{concept.title}</h2>
        </div>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
          ✕
        </button>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-slate-300">{concept.definition}</p>

      <div className="mt-4 flex gap-2 rounded-xl bg-white/5 p-3 text-sm text-slate-300">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-glow" />
        <span>{concept.mnemonic}</span>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-glow/20 bg-amber-glow/5 p-3 text-xs text-amber-glow/90">
        <Brain className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{concept.explanation}</span>
      </div>

      <button
        type="button"
        onClick={onQuiz}
        className="mt-5 w-full rounded-xl bg-amber-glow py-2.5 text-sm font-semibold text-ink transition hover:bg-amber-400"
      >
        Quiz this object
      </button>
    </motion.aside>
  );
}
