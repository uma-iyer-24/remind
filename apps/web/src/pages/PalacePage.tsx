import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import ConceptDetail from "../components/ConceptDetail";
import PalaceScene from "../components/PalaceScene";
import QuizPanel from "../components/QuizPanel";
import { useSessionStore } from "../store/session";

export default function PalacePage() {
  const session = useSessionStore((s) => s.session);
  const selectedId = useSessionStore((s) => s.selectedId);
  const scoringSource = useSessionStore((s) => s.scoringSource);
  const selectConcept = useSessionStore((s) => s.selectConcept);
  const recordQuiz = useSessionStore((s) => s.recordQuiz);
  const applyRanking = useSessionStore((s) => s.applyRanking);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    void applyRanking();
  }, [applyRanking]);

  if (!session) return <Navigate to="/" replace />;

  const selected = session.concepts.find((c) => c.id === selectedId) ?? null;
  const quizConcept = session.concepts.find((c) => c.id === quizId) ?? null;
  const topRisk = [...session.concepts].sort(
    (a, b) => b.forgetProbability - a.forgetProbability,
  )[0];

  return (
    <div className="relative h-[100dvh] overflow-hidden">
      <div className="absolute inset-0">
        <PalaceScene
          concepts={session.concepts}
          selectedId={selectedId}
          onSelect={(id) => {
            selectConcept(id);
            setQuizId(null);
          }}
        />
      </div>

      <header className="pointer-events-none absolute left-0 right-0 top-0 z-10 flex items-start justify-between p-4 md:p-6">
        <div className="pointer-events-auto glass rounded-2xl px-4 py-3">
          <Link to="/" className="text-xs text-slate-400 hover:text-white">
            Remind
          </Link>
          <h1 className="font-display text-lg text-white">{session.title}</h1>
          <p className="mt-1 text-xs text-slate-400">
            Scoring:{" "}
            <span className={scoringSource === "model" ? "text-mint-glow" : "text-amber-glow"}>
              {scoringSource === "model" ? "ML model" : "offline heuristic"}
            </span>
            {topRisk && (
              <>
                {" "}
                · Focus: <span className="text-amber-glow">{topRisk.title}</span>
              </>
            )}
          </p>
        </div>

        <div className="pointer-events-auto flex gap-2">
          <button
            type="button"
            onClick={() => setShowSummary(true)}
            className="glass rounded-xl px-3 py-2 text-xs text-slate-200 hover:bg-white/10"
          >
            Session ({session.correctCount}/{session.quizzesTaken})
          </button>
        </div>
      </header>

      {!selected && !quizConcept && (
        <p className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-center text-xs text-slate-400">
          Click an object to inspect · glowing = higher forget risk
        </p>
      )}

      {selected && !quizConcept && (
        <ConceptDetail
          concept={selected}
          onClose={() => selectConcept(null)}
          onQuiz={() => setQuizId(selected.id)}
        />
      )}

      {quizConcept && (
        <QuizPanel
          concept={quizConcept}
          pool={session.concepts}
          onClose={() => setQuizId(null)}
          onComplete={async (result) => {
            await recordQuiz(quizConcept.id, result);
            setQuizId(null);
          }}
        />
      )}

      {showSummary && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="glass max-w-md rounded-2xl p-6">
            <h2 className="font-display text-2xl text-white">Session summary</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              <li>Quizzes: {session.quizzesTaken}</li>
              <li>Correct: {session.correctCount}</li>
              <li>
                Accuracy:{" "}
                {session.quizzesTaken
                  ? Math.round((session.correctCount / session.quizzesTaken) * 100)
                  : 0}
                %
              </li>
            </ul>
            <p className="mt-4 text-xs text-slate-500">
              Objects with high forget probability are moved forward on the path after each quiz.
            </p>
            <button
              type="button"
              onClick={() => setShowSummary(false)}
              className="mt-6 w-full rounded-xl bg-white/10 py-2 text-sm hover:bg-white/15"
            >
              Continue walking
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
