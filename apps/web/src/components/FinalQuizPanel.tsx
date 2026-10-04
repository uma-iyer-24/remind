import { useMemo, useRef, useState } from "react";
import { buildFinalQuestions } from "../lib/quizQuestions";
import { useSessionStore } from "../store/session";
import type { ConceptState } from "../types";
import { popupPanelClass } from "./InfoPopup";

interface Props {
  concepts: ConceptState[];
  onClose: () => void;
}

export default function FinalQuizPanel({ concepts, onClose }: Props) {
  const questions = useMemo(() => buildFinalQuestions(concepts), [concepts]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const [perTopic, setPerTopic] = useState<Record<string, { right: number; total: number }>>({});
  const saved = useRef(false);
  const recordFinalReview = useSessionStore((s) => s.recordFinalReview);

  const q = questions[index];
  const explored = concepts.filter((c) => (c.reviewCount ?? 0) > 0 || c.encountered).length;

  const choose = (option: number) => {
    if (picked !== null || !q) return;
    setPicked(option);
    const ok = option === q.correctIndex;
    if (ok) setCorrect((n) => n + 1);
    const topicId = q.conceptId ?? "";
    if (!topicId) return;
    setPerTopic((prev) => {
      const cur = prev[topicId] ?? { right: 0, total: 0 };
      return { ...prev, [topicId]: { right: cur.right + (ok ? 1 : 0), total: cur.total + 1 } };
    });
  };

  const next = () => {
    if (index + 1 >= questions.length) {
      if (!saved.current) {
        saved.current = true;
        recordFinalReview(
          Object.entries(perTopic).map(([conceptId, score]) => ({
            conceptId,
            correctCount: score.right,
            totalQuestions: score.total,
          })),
        );
      }
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setPicked(null);
  };

  const mastery =
    concepts.filter((c) => c.encountered).length === 0
      ? null
      : Math.round(
          (concepts.filter((c) => c.encountered).reduce((sum, c) => sum + (c.mastery ?? 0), 0) /
            concepts.filter((c) => c.encountered).length) *
            100,
        );

  return (
    <div className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/50 p-4 md:items-center">
      <div className={`max-h-[88vh] w-full max-w-xl overflow-y-auto p-5 ${popupPanelClass}`}>
        <p className="text-xs font-semibold uppercase tracking-widest text-teal-900">Final memory check</p>
        <h3 className="mt-1 font-display text-2xl text-slate-950">Review the whole palace</h3>

        {!done && q && (
          <>
            <p className="mt-1 text-xs text-slate-500">
              Question {index + 1} / {questions.length}
            </p>
            <p className="mt-4 font-medium text-slate-900">{q.prompt}</p>
            <div className="mt-3 space-y-2">
              {q.options.map((opt, i) => {
                const show = picked !== null;
                const isCorrect = i === q.correctIndex;
                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={picked !== null}
                    onClick={() => choose(i)}
                    className={`w-full rounded-xl border px-3 py-2.5 text-left text-sm ${
                      show
                        ? isCorrect
                          ? "border-emerald-700 bg-emerald-50 text-emerald-950"
                          : i === picked
                            ? "border-red-700 bg-red-50 text-red-950"
                            : "border-stone-200 text-slate-500"
                        : "border-stone-300 bg-white text-slate-900 hover:border-teal-800"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {picked !== null && (
              <button type="button" onClick={next} className="mt-4 w-full rounded-xl bg-stone-900 py-2.5 text-sm font-semibold text-white">
                {index + 1 >= questions.length ? "See results" : "Next"}
              </button>
            )}
          </>
        )}

        {done && (
          <div className="mt-4 space-y-3 text-sm text-slate-800">
            <p className="font-display text-3xl text-slate-950">Final memory score</p>
            <p>Topics explored: {explored}/{concepts.length}</p>
            <p>
              Questions answered: {questions.length} · Correct: {correct}
            </p>
            <p>Recall after this check (reviewed topics only): {mastery === null ? "not started" : `${mastery}%`}</p>
            <p className="text-slate-600">
              This check updated recall for the topics it asked. Door order was not re-ranked, and a room question already used for a topic was left out.
            </p>
            <ul className="space-y-1">
              {concepts.map((c) => (
                <li key={c.id}>
                  {c.title} — {c.encountered ? `${Math.round((c.mastery ?? 0) * 100)}%` : "not reviewed"}
                </li>
              ))}
            </ul>
            <button type="button" onClick={onClose} className="w-full rounded-xl bg-stone-900 py-2.5 text-sm font-semibold text-white">
              Back to the palace
            </button>
          </div>
        )}

        {!done && (
          <button type="button" onClick={onClose} className="mt-4 text-sm text-slate-600">
            Close
          </button>
        )}
      </div>
    </div>
  );
}
