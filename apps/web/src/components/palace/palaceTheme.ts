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
  "#C4B7A6",
  "#8FA396",
  "#D9C7A3",
  "#A39A90",
  "#B08968",
  "#7E92A0",
  "#C3A6A0",
  "#8E9A86",
  "#D2C4B0",
  "#9AA4AE",
  "#A8B5AE",
  "#CDB892",
  "#B7A8A2",
  "#8FA0A8",
  "#C5C0B4",
];

export function accentAt(index: number): string {
  return manorAccents[((index % manorAccents.length) + manorAccents.length) % manorAccents.length]!;
}
