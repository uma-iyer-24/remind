import type { ConceptState } from "../types";

export interface WallTidbit {
  id: string;
  label: string;
  title: string;
  body: string;
}

export function wallTidbitsFor(concept: ConceptState): WallTidbit[] {
  const keywords = concept.keywords?.slice(0, 4).join(", ") ?? concept.title;
  return [
    {
      id: `${concept.id}-core`,
      label: "Plaque",
      title: "Core idea",
      body: concept.definition,
    },
    {
      id: `${concept.id}-hook`,
      label: "Scroll",
      title: "Memory hook",
      body: concept.mnemonic,
    },
    {
      id: `${concept.id}-spatial`,
      label: "Gem",
      title: "Why this room?",
      body: `Associate "${concept.title}" with this room layout: portrait on the back wall, ${concept.prop.shape} on the pedestal, and keywords (${keywords}) on the side plaques.`,
    },
  ];
}
