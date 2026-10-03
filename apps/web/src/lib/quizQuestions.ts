import type { ConceptState } from "../types";

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function pickOthers(pool: ConceptState[], id: string, n: number) {
  return shuffle(pool.filter((c) => c.id !== id)).slice(0, n);
}

export function buildQuizQuestions(target: ConceptState, pool: ConceptState[]): QuizQuestion[] {
  const others = pickOthers(pool, target.id, 4);
  const o = (i: number) => others[i] ?? others[0]!;

  const q1Options = shuffle([
    target.definition,
    o(0).definition,
    o(1).definition,
    o(2).definition,
  ]);

  const q2Options = shuffle([
    target.mnemonic,
    o(0).mnemonic,
    o(1).mnemonic,
    o(2).mnemonic,
  ]);

  const q3Options = shuffle([target.title, o(0).title, o(1).title, o(2).title]);

  const falseStatement = `${target.title} means ignoring validation data entirely when tuning models.`;
  const trueStatement = target.definition;
  const q4Options = shuffle([trueStatement, falseStatement]);

  const keyword = target.keywords?.[0] ?? target.title.split(" ")[0]!;
  const distractorKw = [
    o(0).keywords?.[0] ?? o(0).title.split(" ")[0]!,
    o(1).keywords?.[0] ?? o(1).title.split(" ")[0]!,
    o(2).keywords?.[0] ?? o(2).title.split(" ")[0]!,
  ];
  const q5Options = shuffle([keyword, ...distractorKw.filter((d) => d !== keyword)].slice(0, 3));
  while (q5Options.length < 4) q5Options.push(`term-${q5Options.length}`);

  return [
    {
      id: "def",
      prompt: `Which definition matches “${target.title}”?`,
      options: q1Options,
      correctIndex: q1Options.indexOf(target.definition),
    },
    {
      id: "mnemonic",
      prompt: `Which memory hook belongs to “${target.title}”?`,
      options: q2Options,
      correctIndex: q2Options.indexOf(target.mnemonic),
    },
    {
      id: "title",
      prompt: `Which concept is described as: “${target.definition.slice(0, 72)}${target.definition.length > 72 ? "…" : ""}”`,
      options: q3Options,
      correctIndex: q3Options.indexOf(target.title),
    },
    {
      id: "tf",
      prompt: "Which statement is true?",
      options: q4Options,
      correctIndex: q4Options.indexOf(trueStatement),
    },
    {
      id: "keyword",
      prompt: `Which keyword is most associated with “${target.title}”?`,
      options: q5Options,
      correctIndex: q5Options.indexOf(keyword),
    },
  ];
}
