import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Sparkles, XCircle } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { popupPanelClass } from "./InfoPopup";
import { buildQuizQuestions } from "../lib/quizQuestions";
import type { QuizRecordFeedback } from "../store/session";
import type { ConceptState } from "../types";
import { logEvent } from "../lib/api";

interface Props {
  concept: ConceptState;
  pool: ConceptState[];
  onClose: () => void;
  onComplete: (result: {
    correct: boolean;
    correctCount: number;
    totalQuestions: number;
    rating: string;
    responseTimeMs: number;
  }) => Promise<QuizRecordFeedback>;
}

export default function QuizPanel({ concept, pool, onClose, onComplete }: Props) {
  const [started] = useState(() => performance.now());
  const questions = useMemo(() => buildQuizQuestions(concept, pool), [concept, pool]);
  const [qIndex, setQIndex] = useState(0);
  const [pickedIndex, setPickedIndex] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const correctRef = useRef(0);
  const [finished, setFinished] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [feedback, setFeedback] = useState<QuizRecordFeedback | null>(null);

  const q = questions[qIndex]!;
  const wasCorrect = pickedIndex === q.correctIndex;

  const answer = (optionIndex: number) => {
    if (answered) return;
    const ok = optionIndex === q.correctIndex;
    setPickedIndex(optionIndex);
    setAnswered(true);
    if (ok) {
      correctRef.current += 1;
      setCorrectCount((c) => c + 1);
    }
  };

  const goNext = async () => {
    if (qIndex < questions.length - 1) {
      setQIndex((i) => i + 1);
      setPickedIndex(null);
      setAnswered(false);
      return;
    }

    setFinished(true);
    setUpdating(true);
    const total = questions.length;
    const count = correctRef.current;
    const responseTimeMs = performance.now() - started;
    const pass = count >= Math.ceil(total * 0.6);

    await logEvent({
      concept_id: concept.id,
      correct: pass,
      rating: pass ? "good" : "again",
      response_time_ms: responseTimeMs,
    });

    try {
      const ml = await onComplete({
        correct: pass,
        correctCount: count,
        totalQuestions: total,
        rating: pass ? "good" : "again",
        responseTimeMs,
      });
      setFeedback(ml);
    } finally {
      setUpdating(false);
    }
  };

  // Fix correct count on finish - when answering last question, correctCount updated before goNext
  const handleNext = () => {
    void goNext();
  };

  const displayCorrectCount = finished ? correctRef.current : correctCount;

  const pathMoved =
    feedback && feedback.pathIndexAfter !== feedback.pathIndexBefore
      ? feedback.pathIndexAfter < feedback.pathIndexBefore
        ? "moved closer to the hall (higher priority)"
        : "moved down the corridor"
      : null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-end justify-center p-4 md:items-end md:justify-end md:p-6"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="Close quiz overlay"
        className="absolute inset-0 bg-black/70"
        onClick={() => {
          if (!updating) onClose();
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative z-10 max-h-[90vh] w-full max-w-xl overflow-y-auto p-5 md:max-w-lg ${popupPanelClass}`}
      >
        <div className="mb-1 flex items-center justify-between gap-2">
          <p className="text-xs font-bold uppercase tracking-widest text-teal-800">Recall checkpoint</p>
          {!finished && (
            <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-800">
              Question {qIndex + 1} / {questions.length}
            </span>
          )}
        </div>
        <h3 className="font-display text-2xl font-semibold text-slate-950">{concept.title}</h3>

        {!finished && (
          <>
            <p className="mt-4 text-base font-semibold text-slate-900">{q.prompt}</p>
            <div className="mt-3 space-y-2">
              {q.options.map((opt, i) => {
                const show = answered;
                const isCorrect = i === q.correctIndex;
                const isPicked = i === pickedIndex;
                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={answered}
                    onClick={() => answer(i)}
                    className={`w-full rounded-xl border-2 px-3 py-2.5 text-left text-sm transition ${
                      show
                        ? isCorrect
                          ? "border-emerald-600 bg-emerald-50 text-emerald-950"
                          : isPicked
                            ? "border-red-600 bg-red-50 text-red-950"
                            : "border-slate-200 bg-white text-slate-600"
                        : "border-slate-300 bg-white text-slate-900 hover:border-teal-600 hover:bg-teal-50"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {answered && (
              <div
                className={`mt-4 flex items-center gap-2 rounded-xl border-2 px-3 py-2 ${
                  wasCorrect ? "border-emerald-700 bg-emerald-100" : "border-red-700 bg-red-100"
                }`}
              >
                {wasCorrect ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-800" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-700" />
                )}
                <span className={`font-semibold ${wasCorrect ? "text-emerald-900" : "text-red-900"}`}>
                  {wasCorrect ? "Correct!" : "Not quite — see the green option"}
                </span>
              </div>
            )}

            {answered && (
              <button
                type="button"
                onClick={handleNext}
                className="mt-4 w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                {qIndex < questions.length - 1 ? "Next question" : "See results & update ML"}
              </button>
            )}
          </>
        )}

        {finished && (
          <>
            <div className="mt-4 rounded-xl border-2 border-slate-300 bg-slate-50 px-4 py-3">
              <p className="font-display text-2xl font-semibold text-slate-950">
                Score: {displayCorrectCount} / {questions.length}
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {displayCorrectCount >= Math.ceil(questions.length * 0.6)
                  ? "Strong recall — predictions will treat this as mostly solid."
                  : "Some gaps — expect higher forget risk and door reprioritization."}
              </p>
            </div>

            <div className="mt-4 rounded-xl border-2 border-slate-300 bg-slate-50 p-4">
              {updating ? (
                <div className="flex items-center gap-2 text-slate-800">
                  <Loader2 className="h-5 w-5 animate-spin text-teal-700" />
                  <span className="text-sm font-medium">Updating forget predictions from your answers…</span>
                </div>
              ) : feedback ? (
                <div className="space-y-2 text-slate-900">
                  <div className="flex items-center gap-2 text-sm font-bold text-teal-900">
                    <Sparkles className="h-4 w-4" />
                    Predictions updated
                    <span className="rounded-full border border-slate-400 bg-white px-2 py-0.5 text-xs font-semibold">
                      {feedback.scoringSource === "model" ? "ML model" : "offline heuristic"}
                    </span>
                  </div>
                  <p className="text-sm">
                    <span className="font-semibold">{feedback.conceptTitle}</span>:{" "}
                    {Math.round(feedback.forgetProbability * 100)}% forget risk
                  </p>
                  <p className="text-sm text-slate-700">{feedback.explanation}</p>
                  {pathMoved && (
                    <p className="text-sm font-medium text-emerald-800">
                      Palace reordered — this topic&apos;s door {pathMoved}.
                    </p>
                  )}
                </div>
              ) : null}
            </div>

            {!updating && (
              <button
                type="button"
                onClick={onClose}
                className="mt-5 w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Continue
              </button>
            )}
          </>
        )}

        {!finished && !answered && (
          <button
            type="button"
            onClick={onClose}
            className="mt-4 text-sm font-medium text-slate-600 hover:text-slate-950"
          >
            Cancel quiz
          </button>
        )}
      </motion.div>
    </div>
  );
}
