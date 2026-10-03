import { getPalaceSlot } from "./palaceLayout";
import type { ConceptState } from "../types";

export function getRoomExitTarget(
  concepts: ConceptState[],
  roomId: string,
): { corridorPos: [number, number, number]; yaw: number } | null {
  const ordered = [...concepts].sort((a, b) => a.pathIndex - b.pathIndex);
  const idx = ordered.findIndex((c) => c.id === roomId);
  if (idx < 0) return null;
  const slot = getPalaceSlot(idx);
  const sign = slot.side === "left" ? -1 : 1;
  return {
    corridorPos: [sign * 0.8, 1.65, slot.corridorZ + 0.5],
    yaw: slot.side === "left" ? Math.PI / 2 : -Math.PI / 2,
  };
}
