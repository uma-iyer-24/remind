import { Home } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import ConceptDetail from "../components/ConceptDetail";
import InfoPopup from "../components/InfoPopup";
import PalaceScene from "../components/PalaceScene";
import PortraitPopup from "../components/PortraitPopup";
import QuizPanel from "../components/QuizPanel";
import PalaceHud, { type PalaceHudState } from "../components/palace/PalaceHud";
import type { WallTidbit } from "../lib/wallTidbits";
import { useSessionStore } from "../store/session";

export default function PalacePage() {
  const session = useSessionStore((s) => s.session);
  const selectedId = useSessionStore((s) => s.selectedId);
  const scoringSource = useSessionStore((s) => s.scoringSource);
  const selectConcept = useSessionStore((s) => s.selectConcept);
  const recordQuiz = useSessionStore((s) => s.recordQuiz);
  const applyRanking = useSessionStore((s) => s.applyRanking);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [portraitId, setPortraitId] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [hud, setHud] = useState<PalaceHudState | null>(null);
  const [tidbit, setTidbit] = useState<WallTidbit | null>(null);

  useEffect(() => {
    void applyRanking();
  }, [applyRanking]);

  if (!session) return <Navigate to="/" replace />;

  const selected = session.concepts.find((c) => c.id === selectedId) ?? null;
  const portraitConcept = session.concepts.find((c) => c.id === portraitId) ?? null;
  const quizConcept = session.concepts.find((c) => c.id === quizId) ?? null;
  const topRisk = [...session.concepts].sort(
    (a, b) => b.forgetProbability - a.forgetProbability,
  )[0];

  const modalOpen = !!quizConcept || !!tidbit || !!portraitConcept;

  return (
    <div className="relative h-[100dvh] overflow-hidden">
      <div className="absolute inset-0">
        <PalaceScene
          concepts={session.concepts}
          selectedId={selectedId}
          uiBlocking={modalOpen || showSummary}
          onHudChange={setHud}
          onTidbitClick={setTidbit}
          onPortraitClick={(id) => {
            setPortraitId(id);
            selectConcept(null);
            setTidbit(null);
          }}
          onSelect={(id) => {
            selectConcept(id);
            setQuizId(null);
            setTidbit(null);
            setPortraitId(null);
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

        <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-2">
          <Link
            to="/"
            className="glass flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/10 hover:text-white"
          >
            <Home className="h-4 w-4 shrink-0" aria-hidden />
            Home
          </Link>
          <button
            type="button"
            onClick={() => setShowSummary(true)}
            className="glass rounded-xl px-3 py-2 text-xs text-slate-200 hover:bg-white/10"
          >
            Session ({session.correctCount}/{session.totalQuestions ?? 0})
          </button>
        </div>
      </header>

      {!modalOpen && !showSummary && <PalaceHud state={hud} />}

      {tidbit && !quizConcept && (
        <div className="absolute inset-0 z-[9000] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md">
            <InfoPopup title={tidbit.title} subtitle="Wall note" onClose={() => setTidbit(null)}>
              {tidbit.body}
            </InfoPopup>
          </div>
        </div>
      )}

      {portraitConcept && !quizConcept && (
        <PortraitPopup
          concept={portraitConcept}
          onClose={() => setPortraitId(null)}
          onQuiz={() => {
            setQuizId(portraitConcept.id);
            setPortraitId(null);
          }}
        />
      )}

      {selected && !quizConcept && !portraitConcept && !tidbit && (
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
          onComplete={(result) => recordQuiz(quizConcept.id, result)}
        />
      )}

      {showSummary && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-md">
            <InfoPopup
              title="Session summary"
              onClose={() => setShowSummary(false)}
              footer={
                <button
                  type="button"
                  onClick={() => setShowSummary(false)}
                  className="w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Continue walking
                </button>
              }
            >
              <ul className="space-y-2 font-medium text-slate-900">
                <li>Quizzes completed: {session.quizzesTaken}</li>
                <li>
                  Answers correct: {session.correctCount} / {session.totalQuestions}
                </li>
                <li>
                  Accuracy:{" "}
                  {session.totalQuestions
                    ? Math.round((session.correctCount / session.totalQuestions) * 100)
                    : 0}
                  %
                </li>
              </ul>
              <p className="mt-4 text-sm text-slate-700">
                Each quiz has 5 questions. High-risk topics get doors closer to the hall after weak scores.
              </p>
            </InfoPopup>
          </div>
        </div>
      )}
    </div>
  );
}
