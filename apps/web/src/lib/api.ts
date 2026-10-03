import type { ConceptState } from "../types";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

export interface RankItem {
  concept_id: string;
  forget_probability: number;
  explanation: string;
}

function featuresFromConcept(c: ConceptState, pathNorm: number) {
  const elapsedDays = c.lastReviewedAt
    ? (Date.now() - c.lastReviewedAt) / (1000 * 60 * 60 * 24)
    : 0;
  return {
    concept_id: c.id,
    elapsed_days_since_last_review: elapsedDays,
    review_count: c.reviewCount,
    success_streak: c.successStreak,
    fail_streak: c.failStreak,
    avg_response_time_ms: c.avgResponseTimeMs || 4500,
    quiz_type_mc: 1,
    position_index_on_path: pathNorm,
    concept_text_length: Math.max(c.title.length + c.definition.length, 10),
  };
}

export async function rankConcepts(concepts: ConceptState[]): Promise<{
  ordered: RankItem[];
  source: string;
}> {
  const body = {
    user_id: "anonymous",
    concepts: concepts.map((c, i) =>
      featuresFromConcept(c, i / Math.max(concepts.length - 1, 1)),
    ),
  };

  try {
    const res = await fetch(`${API_BASE}/api/v1/rank-concepts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("rank failed");
    return res.json();
  } catch {
    return heuristicRank(concepts);
  }
}

function heuristicRank(concepts: ConceptState[]): {
  ordered: RankItem[];
  source: string;
} {
  const items = concepts.map((c, i) => {
    const elapsedDays = c.lastReviewedAt
      ? (Date.now() - c.lastReviewedAt) / (1000 * 60 * 60 * 24)
      : 0;
    const logit =
      0.35 * elapsedDays -
      0.25 * c.successStreak +
      0.5 * c.failStreak +
      0.1 * (i / Math.max(concepts.length - 1, 1));
    const p = 1 / (1 + Math.exp(-logit));
    return {
      concept_id: c.id,
      forget_probability: p,
      explanation: `Predicted ${Math.round(p * 100)}% forget risk (offline)`,
    };
  });
  items.sort((a, b) => b.forget_probability - a.forget_probability);
  return { ordered: items, source: "heuristic" };
}

export async function logEvent(payload: {
  concept_id: string;
  correct: boolean;
  rating: string;
  response_time_ms: number;
}) {
  try {
    await fetch(`${API_BASE}/api/v1/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: "anonymous", quiz_type: "mcq", ...payload }),
    });
  } catch {
    /* ignore */
  }
}
