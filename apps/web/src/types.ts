export type PropShape =
  | "cube"
  | "octahedron"
  | "torus"
  | "stairs"
  | "spring"
  | "crosshair"
  | "pyramid"
  | "gem"
  | "crack"
  | "pie"
  | "dial"
  | "cluster"
  | "vine"
  | "constellation"
  | "flame"
  | "ruler"
  | "network";

export interface PropConfig {
  shape: PropShape | string;
  color: string;
}

export interface Concept {
  id: string;
  title: string;
  definition: string;
  mnemonic: string;
  keywords?: string[];
  prop: PropConfig;
}

export interface ConceptState extends Concept {
  position: [number, number, number];
  pathIndex: number;
  reviewCount: number;
  successStreak: number;
  failStreak: number;
  lastReviewedAt: number | null;
  avgResponseTimeMs: number;
  forgetProbability: number;
  explanation: string;
}

export interface PalaceSession {
  id: string;
  title: string;
  concepts: ConceptState[];
  startedAt: number;
  quizzesTaken: number;
  correctCount: number;
}
