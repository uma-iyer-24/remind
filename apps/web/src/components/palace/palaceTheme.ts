/** Colourful manor interior — realistic layout, vivid décor. */

export const palaceTheme = {
  sky: "#B8D4E8",
  fogNear: 20,
  fogFar: 52,

  wall: "#FFF5EB",
  wallShadow: "#F5E6D8",
  wainscot: "#F0E4D6",
  ceiling: "#FFFBF5",

  trim: "#5C4033",
  trimHighlight: "#C17F59",
  brass: "#D4AF37",

  floorWood: "#8B5E3C",
  floorWoodDark: "#6B4423",
  runner: "#9D174D",

  door: "#FFFBF7",
  doorFrame: "#4A3728",

  lightWarm: "#FFE8C8",
  lightWindow: "#FFF9E6",
};

/** Rotating accent colours for walls, art, upholstery, and rugs. */
export const manorAccents = [
  "#FF6B9D",
  "#4ECDC4",
  "#FFE066",
  "#A78BFA",
  "#FB923C",
  "#38BDF8",
  "#F472B6",
  "#34D399",
  "#F87171",
  "#818CF8",
  "#2DD4BF",
  "#FBBF24",
  "#E879F9",
  "#22D3EE",
  "#A3E635",
];

export function accentAt(index: number): string {
  return manorAccents[((index % manorAccents.length) + manorAccents.length) % manorAccents.length]!;
}
