import * as THREE from "three";
import { accentAt, palaceTheme as t } from "./palaceTheme";

export function mixHex(hex: string, target: string, amount: number): string {
  const a = new THREE.Color(hex);
  a.lerp(new THREE.Color(target), amount);
  return `#${a.getHexString()}`;
}

/** Vivid study-room wallpaper while keeping wood trim realistic. */
export function roomPalette(accent: string, dimmed: boolean) {
  const mix = dimmed ? 0.38 : 0.08;
  return {
    wallpaper: mixHex(accent, "#FFF0F5", mix),
    back: mixHex(accent, "#FFE4EC", mix + 0.06),
    side: mixHex(accent, "#FDF2F8", mix + 0.04),
    floor: t.floorWood,
    floorBoard: t.floorWoodDark,
    ceiling: mixHex(accent, t.ceiling, 0.06),
    wainscot: mixHex(accent, t.wainscot, dimmed ? 0.35 : 0.12),
    trim: t.trim,
    rug: mixHex(accent, t.runner, dimmed ? 0.25 : 0.12),
    curtain: mixHex(accent, "#FFFFFF", 0.15),
    upholstery: mixHex(accent, "#4A3728", 0.35),
  };
}

export const corridorStripes = manorAccentsFromTheme();

function manorAccentsFromTheme() {
  return [
    "#FFB4C4",
    "#BAE6FD",
    "#FDE68A",
    "#DDD6FE",
    "#FED7AA",
    "#A7F3D0",
    "#FECACA",
    "#C4B5FD",
  ];
}

export function hallWallColor(side: "left" | "right"): string {
  return side === "left" ? "#FFE4E6" : "#E0F2FE";
}

export function corridorWallColor(segmentIndex: number): string {
  return corridorStripes[segmentIndex % corridorStripes.length]!;
}

export { accentAt };

export const hallTiles = [t.floorWood, t.floorWoodDark];
