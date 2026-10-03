import { create } from "zustand";
import { persist } from "zustand/middleware";
import mlDeck from "../data/ml-concepts.json";
import { layoutPositions } from "../lib/layout";
import { rankConcepts } from "../lib/api";
import type { Concept, ConceptState, PalaceSession } from "../types";

interface SessionStore {
  session: PalaceSession | null;
  selectedId: string | null;
  scoringSource: string;
  startFromDeck: (deckId?: string) => void;
  startCustom: (title: string, concepts: Concept[]) => void;
  selectConcept: (id: string | null) => void;
  applyRanking: () => Promise<void>;
  recordQuiz: (
    id: string,
    result: { correct: boolean; rating: string; responseTimeMs: number },
  ) => Promise<void>;
  reset: () => void;
}

function initConcepts(concepts: Concept[], title: string): PalaceSession {
  const positions = layoutPositions(concepts.length);
  const states: ConceptState[] = concepts.map((c, i) => ({
    ...c,
    position: positions[i]!,
    pathIndex: i,
    reviewCount: 0,
    successStreak: 0,
    failStreak: 0,
    lastReviewedAt: null,
    avgResponseTimeMs: 4500,
    forgetProbability: 0.35,
    explanation: "Not reviewed yet",
  }));
  return {
    id: crypto.randomUUID(),
    title,
    concepts: states,
    startedAt: Date.now(),
    quizzesTaken: 0,
    correctCount: 0,
  };
}

function repositionByRank(session: PalaceSession, orderedIds: string[]): PalaceSession {
  const positions = layoutPositions(session.concepts.length);
  const rankMap = new Map(orderedIds.map((id, i) => [id, i]));
  const concepts = session.concepts.map((c) => {
    const rank = rankMap.get(c.id) ?? c.pathIndex;
    return { ...c, pathIndex: rank, position: positions[rank]! };
  });
  return { ...session, concepts };
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      session: null,
      selectedId: null,
      scoringSource: "heuristic",

      startFromDeck: () => {
        const deck = mlDeck as { title: string; concepts: Concept[] };
        set({
          session: initConcepts(deck.concepts, deck.title),
          selectedId: null,
          scoringSource: "heuristic",
        });
        void get().applyRanking();
      },

      startCustom: (title, concepts) => {
        set({
          session: initConcepts(concepts.slice(0, 30), title),
          selectedId: null,
          scoringSource: "heuristic",
        });
        void get().applyRanking();
      },

      selectConcept: (id) => set({ selectedId: id }),

      applyRanking: async () => {
        const { session } = get();
        if (!session) return;
        const { ordered, source } = await rankConcepts(session.concepts);
        const probMap = new Map(
          ordered.map((o) => [o.concept_id, { p: o.forget_probability, e: o.explanation }]),
        );
        let updated = {
          ...session,
          concepts: session.concepts.map((c) => ({
            ...c,
            forgetProbability: probMap.get(c.id)?.p ?? c.forgetProbability,
            explanation: probMap.get(c.id)?.e ?? c.explanation,
          })),
        };
        updated = repositionByRank(
          updated,
          ordered.map((o) => o.concept_id),
        );
        set({ session: updated, scoringSource: source });
      },

      recordQuiz: async (id, result) => {
        const { session } = get();
        if (!session) return;
        const concepts = session.concepts.map((c) => {
          if (c.id !== id) return c;
          const reviewCount = c.reviewCount + 1;
          const successStreak = result.correct ? c.successStreak + 1 : 0;
          const failStreak = result.correct ? 0 : c.failStreak + 1;
          const avgResponseTimeMs =
            (c.avgResponseTimeMs * c.reviewCount + result.responseTimeMs) /
            Math.max(reviewCount, 1);
          return {
            ...c,
            reviewCount,
            successStreak,
            failStreak,
            lastReviewedAt: Date.now(),
            avgResponseTimeMs,
          };
        });
        set({
          session: {
            ...session,
            concepts,
            quizzesTaken: session.quizzesTaken + 1,
            correctCount: session.correctCount + (result.correct ? 1 : 0),
          },
        });
        await get().applyRanking();
      },

      reset: () => set({ session: null, selectedId: null }),
    }),
    { name: "remind-session", partialize: (s) => ({ session: s.session }) },
  ),
);
