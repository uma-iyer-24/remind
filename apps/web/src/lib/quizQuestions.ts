import type { ConceptState } from "../types";
import { knowledgeFor, type TopicKnowledge } from "./topicKnowledge";

export type QuizTemplate = "meaning" | "use" | "distinct" | "scene" | "hook" | "transfer" | "contrast";

export interface QuizQuestion {
  id: string;
  template: QuizTemplate;
  conceptId?: string;
  prompt: string;
  options: string[];
  correctIndex: number;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function uniqueOptions(correct: string, distractors: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of [correct, ...distractors]) {
    const text = raw.trim();
    const key = text.toLowerCase();
    if (!text || seen.has(key)) continue;
    seen.add(key);
    out.push(text);
  }
  return out.slice(0, 4);
}

function otherKnowledge(pool: ConceptState[], id: string): TopicKnowledge[] {
  return pool.filter((c) => c.id !== id).map((c) => knowledgeFor(c.title));
}

function asQuestion(
  id: string,
  template: QuizTemplate,
  prompt: string,
  correct: string,
  distractors: string[],
  conceptId?: string,
): QuizQuestion | null {
  const options = shuffle(uniqueOptions(correct, distractors));
  if (options.length < 3 || !options.includes(correct)) return null;
  return { id, template, conceptId, prompt, options, correctIndex: options.indexOf(correct) };
}

function resolvedKnowledge(target: ConceptState): TopicKnowledge & { semanticId: string } {
  const classified = knowledgeFor(target.title);
  if (classified.semanticId === "generic" && target.definition && !target.definition.startsWith("Remember:")) {
    return {
      ...classified,
      definition: target.definition,
      hook: target.mnemonic || classified.hook,
      application: target.definition,
    };
  }
  return classified;
}

/** Questions test the idea, not whether the learner can spot the topic title. */
export function buildQuizQuestions(target: ConceptState, pool: ConceptState[]): QuizQuestion[] {
  const know = resolvedKnowledge(target);
  const others = otherKnowledge(pool, target.id);
  const defs = others.map((k) => k.definition);
  const apps = others.map((k) => k.application);
  const dists = others.map((k) => k.distinction);
  const scenarios = others.map((k) => k.scenarioAnswer);

  const made = [
    asQuestion("meaning", "meaning", `Which statement best describes this idea?`, know.definition, defs, target.id),
    asQuestion("use", "use", "When would you reach for this idea?", know.application, apps, target.id),
    asQuestion("distinct", "distinct", "Which contrast is accurate?", know.distinction, dists, target.id),
    asQuestion("scene", "scene", know.scenarioPrompt, know.scenarioAnswer, scenarios, target.id),
    asQuestion("hook", "hook", "Which picture matches how this idea works?", know.hook, others.map((k) => k.hook), target.id),
  ].filter((q): q is QuizQuestion => q !== null);

  return made.slice(0, 5);
}

const ROOM_TEMPLATES: QuizTemplate[] = ["meaning", "use", "distinct", "scene", "hook"];

function finalQuestion(topic: ConceptState, pool: ConceptState[], order: number): QuizQuestion | null {
  const know = resolvedKnowledge(topic);
  const others = otherKnowledge(pool, topic.id);
  const used = topic.reviewCount > 0 ? new Set<QuizTemplate>(ROOM_TEMPLATES) : new Set<QuizTemplate>();
  const bank: { template: QuizTemplate; prompt: string; correct: string; distractors: string[] }[] = [
    {
      template: "scene",
      prompt: know.scenarioPrompt,
      correct: know.scenarioAnswer,
      distractors: others.map((k) => k.scenarioAnswer),
    },
    {
      template: "distinct",
      prompt: `About “${topic.title}”: which distinction is right?`,
      correct: know.distinction,
      distractors: others.map((k) => k.distinction),
    },
    {
      template: "use",
      prompt: `You are deciding whether “${topic.title}” applies. Which reason is sound?`,
      correct: know.application,
      distractors: others.map((k) => k.application),
    },
    {
      template: "transfer",
      prompt: `Which account should stay with “${topic.title}” after you leave the room?`,
      correct: know.definition,
      distractors: others.map((k) => k.definition),
    },
    {
      template: "contrast",
      prompt: `How would you separate “${topic.title}” from a neighboring idea?`,
      correct: know.distinction,
      distractors: others.map((k) => k.distinction),
    },
  ];
  const open = bank.filter((item) => !used.has(item.template));
  if (open.length === 0) return null;
  const choice = open[order % open.length]!;
  return asQuestion(
    `final-${choice.template}-${topic.id}`,
    choice.template,
    choice.prompt,
    choice.correct,
    choice.distractors,
    topic.id,
  );
}

export function buildFinalQuestions(pool: ConceptState[]): QuizQuestion[] {
  const picked = shuffle(pool).slice(0, Math.min(pool.length, 8));
  const questions: QuizQuestion[] = [];
  picked.forEach((topic, index) => {
    const q = finalQuestion(topic, pool, index);
    if (q) questions.push(q);
  });
  return questions.slice(0, 8);
}
