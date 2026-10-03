import propMap from "../data/prop-map.json";
import type { PropConfig } from "../types";

const rules = propMap.rules as { match: string[]; prop: PropConfig }[];
const fallback = propMap.default as PropConfig;

export function matchPropFromText(text: string): PropConfig {
  const lower = text.toLowerCase();
  for (const rule of rules) {
    if (rule.match.some((m) => lower.includes(m))) {
      return rule.prop;
    }
  }
  return fallback;
}

export function slugId(text: string, index: number): string {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32);
  return base || `concept-${index}`;
}
