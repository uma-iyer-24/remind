import { matchPropFromText, slugId } from "./propMatch";
import { classifyTopic, knowledgeFor } from "./topicKnowledge";
import type { Concept } from "../types";

/** Place concepts along a U-shaped path in the room. */
export function layoutPositions(count: number): [number, number, number][] {
  const positions: [number, number, number][] = [];
  const radius = 3.2;
  for (let i = 0; i < count; i++) {
    const t = i / Math.max(count - 1, 1);
    const angle = Math.PI * 0.15 + t * Math.PI * 0.7;
    const x = Math.sin(angle) * radius;
    const z = -Math.cos(angle) * radius + 1;
    const y = 0.6 + (i % 3) * 0.35;
    positions.push([x, y, z]);
  }
  return positions;
}

export function conceptsFromLines(lines: string[]): Concept[] {
  return lines
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line, i) => {
      const know = knowledgeFor(line);
      const prop = matchPropFromText(line);
      return {
        id: slugId(line, i),
        title: line,
        definition: know.definition,
        mnemonic: know.hook,
        keywords: line.toLowerCase().split(/\s+/),
        semanticId: know.semanticId,
        prop: { ...prop, shape: know.semanticId === "generic" ? prop.shape : classifyTopic(line) },
      };
    });
}
