import { Home } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import ConceptDetail from "../components/ConceptDetail";
import InfoPopup from "../components/InfoPopup";
import PalaceScene from "../components/PalaceScene";
import PortraitPopup from "../components/PortraitPopup";
import QuizPanel from "../components/QuizPanel";
import FinalQuizPanel from "../components/FinalQuizPanel";
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
  const [finale, setFinale] = useState(false);

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

  const modalOpen = !!quizConcept || !!tidbit || !!portraitConcept || finale;
  const explored = session.concepts.filter((c) => (c.reviewCount ?? 0) > 0 || c.encountered).length;
  const seen = session.concepts.filter((c) => c.encountered);
  const mastery =
    seen.length === 0 ? null : Math.round((seen.reduce((sum, c) => sum + (c.mastery ?? 0), 0) / seen.length) * 100);
  const progress = session.concepts.length ? Math.round((explored / session.concepts.length) * 100) : 0;
  const nextTopic = [...session.concepts].sort((a, b) => {
    const aSeen = a.encountered ? 1 : 0;
    const bSeen = b.encountered ? 1 : 0;
    if (aSeen !== bSeen) return aSeen - bSeen;
    return (a.mastery ?? 0) - (b.mastery ?? 0);
  })[0];

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
          onOpenFinale={() => setFinale(true)}
          onSelect={(id) => {
            selectConcept(id);
            setQuizId(null);
            setTidbit(null);
            setPortraitId(null);
          }}
        />
      </div>

      <header className="pointer-events-none absolute left-0 right-0 top-0 z-10 flex items-start justify-between p-4 md:p-6">
        <div className="pointer-events-auto rounded-2xl border border-stone-300/80 bg-[#F6F1E8]/95 px-4 py-3 text-stone-900 shadow-lg">
          <Link to="/" className="text-xs text-stone-500 hover:text-stone-900">
            ReMind
          </Link>
          <h1 className="font-display text-lg">{session.title}</h1>
          <p className="mt-1 text-xs text-stone-600">
            {explored}/{session.concepts.length} topics explored · {progress}%
          </p>
          <div className="mt-2 h-1.5 w-36 overflow-hidden rounded-full bg-stone-200">
            <div className="h-full bg-[#3E6B66]" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-1 text-[10px] uppercase tracking-wide text-stone-500">
            Next: {nextTopic ? nextTopic.title : "—"}
            {scoringSource === "model" ? " · forget model" : " · heuristic"}
            {topRisk ? ` · fragile ${topRisk.title}` : ""}
          </p>
        </div>

        <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-2">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-xl border border-stone-300 bg-[#F6F1E8]/95 px-3 py-2 text-xs font-medium text-stone-800 shadow-lg hover:bg-white"
          >
            <Home className="h-4 w-4 shrink-0" aria-hidden />
            Home
          </Link>
          <button
            type="button"
            onClick={() => setShowSummary(true)}
            className="rounded-xl border border-stone-300 bg-[#F6F1E8]/95 px-3 py-2 text-xs text-stone-800 shadow-lg hover:bg-white"
          >
            Recall {mastery === null ? "—" : `${mastery}%`}
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

      {finale && <FinalQuizPanel concepts={session.concepts} onClose={() => setFinale(false)} />}

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
