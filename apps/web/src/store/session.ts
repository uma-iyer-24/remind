import { create } from "zustand";
import { persist } from "zustand/middleware";
import mlDeck from "../data/ml-concepts.json";
import { getPalaceSlot } from "../lib/palaceLayout";
import { rankConcepts } from "../lib/api";
import type { Concept, ConceptState, PalaceSession } from "../types";

export interface QuizRecordFeedback {
  scoringSource: string;
  forgetProbability: number;
  explanation: string;
  pathIndexBefore: number;
  pathIndexAfter: number;
  conceptTitle: string;
}

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
    result: {
      correct: boolean;
      correctCount: number;
      totalQuestions: number;
      rating: string;
      responseTimeMs: number;
    },
  ) => Promise<QuizRecordFeedback>;
  /** Final check only. Updates mastery for topics that were asked. Does not re-rank doors. */
  recordFinalReview: (items: { conceptId: string; correctCount: number; totalQuestions: number }[]) => void;
  reset: () => void;
}

function nextMastery(prev: number, passed: boolean, ratio: number): number {
  return passed ? Math.min(1, prev * 0.35 + ratio * 0.65) : Math.max(0, prev * 0.55 + ratio * 0.25);
}

function initConcepts(concepts: Concept[], title: string): PalaceSession {
  const states: ConceptState[] = concepts.map((c, i) => ({
    ...c,
    position: getPalaceSlot(i).center,
    pathIndex: i,
    reviewCount: 0,
    successStreak: 0,
    failStreak: 0,
    lastReviewedAt: null,
    avgResponseTimeMs: 4500,
    forgetProbability: 0.35,
    explanation: "Not reviewed yet",
    mastery: 0,
    encountered: false,
  }));
  return {
    id: crypto.randomUUID(),
    title,
    concepts: states,
    startedAt: Date.now(),
    quizzesTaken: 0,
    correctCount: 0,
    totalQuestions: 0,
  };
}

function repositionByRank(session: PalaceSession, orderedIds: string[]): PalaceSession {
  const rankMap = new Map(orderedIds.map((id, i) => [id, i]));
  const concepts = session.concepts.map((c) => {
    const rank = rankMap.get(c.id) ?? c.pathIndex;
    return { ...c, pathIndex: rank, position: getPalaceSlot(rank).center };
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
          session: initConcepts(concepts, title),
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
        if (!session) {
          return {
            scoringSource: "heuristic",
            forgetProbability: 0,
            explanation: "",
            pathIndexBefore: 0,
            pathIndexAfter: 0,
            conceptTitle: "",
          };
        }
        const before = session.concepts.find((c) => c.id === id);
        const pathIndexBefore = before?.pathIndex ?? 0;

        const concepts = session.concepts.map((c) => {
          if (c.id !== id) return c;
          const reviewCount = c.reviewCount + 1;
          const successStreak = result.correct ? c.successStreak + 1 : 0;
          const failStreak = result.correct ? 0 : c.failStreak + 1;
          const avgResponseTimeMs =
            (c.avgResponseTimeMs * c.reviewCount + result.responseTimeMs) /
            Math.max(reviewCount, 1);
          const ratio = result.correctCount / Math.max(result.totalQuestions, 1);
          const prev = c.mastery ?? 0;
          const mastery = nextMastery(prev, result.correct, ratio);
          return {
            ...c,
            reviewCount,
            successStreak,
            failStreak,
            lastReviewedAt: Date.now(),
            avgResponseTimeMs,
            mastery,
            encountered: true,
          };
        });
        set({
          session: {
            ...session,
            concepts,
            quizzesTaken: session.quizzesTaken + 1,
            correctCount: session.correctCount + result.correctCount,
            totalQuestions: session.totalQuestions + result.totalQuestions,
          },
        });
        await get().applyRanking();

        const after = get().session?.concepts.find((c) => c.id === id);
        return {
          scoringSource: get().scoringSource,
          forgetProbability: after?.forgetProbability ?? 0,
          explanation: after?.explanation ?? "",
          pathIndexBefore,
          pathIndexAfter: after?.pathIndex ?? pathIndexBefore,
          conceptTitle: after?.title ?? before?.title ?? "",
        };
      },

      recordFinalReview: (items) => {
        const { session } = get();
        if (!session || items.length === 0) return;
        const byId = new Map<string, { correctCount: number; totalQuestions: number }>();
        for (const item of items) {
          const cur = byId.get(item.conceptId) ?? { correctCount: 0, totalQuestions: 0 };
          byId.set(item.conceptId, {
            correctCount: cur.correctCount + item.correctCount,
            totalQuestions: cur.totalQuestions + item.totalQuestions,
          });
        }
        let addedCorrect = 0;
        let addedQuestions = 0;
        const concepts = session.concepts.map((c) => {
          const result = byId.get(c.id);
          if (!result || result.totalQuestions <= 0) return c;
          const ratio = result.correctCount / result.totalQuestions;
          const passed = ratio >= 0.6;
          addedCorrect += result.correctCount;
          addedQuestions += result.totalQuestions;
          return {
            ...c,
            reviewCount: c.reviewCount + 1,
            successStreak: passed ? c.successStreak + 1 : 0,
            failStreak: passed ? 0 : c.failStreak + 1,
            lastReviewedAt: Date.now(),
            mastery: nextMastery(c.mastery ?? 0, passed, ratio),
            encountered: true,
          };
        });
        set({
          session: {
            ...session,
            concepts,
            quizzesTaken: session.quizzesTaken + 1,
            correctCount: session.correctCount + addedCorrect,
            totalQuestions: session.totalQuestions + addedQuestions,
          },
        });
      },

      reset: () => set({ session: null, selectedId: null }),
    }),
    { name: "remind-session", partialize: (s) => ({ session: s.session }) },
  ),
);
