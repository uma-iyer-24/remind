/** Palace layout: hall + corridor with one topic room per concept (ordered by pathIndex). */

export const CORRIDOR_WIDTH = 3.2;
export const ROOM_WIDTH = 5.5;
export const ROOM_DEPTH = 6;
export const ROOM_HEIGHT = 3.4;
export const DOOR_SPACING = 11;
export const HALL_LENGTH = 14;
export const HALL_WIDTH = 12;
export const PLAYER_EYE = 1.65;
export const MOVE_SPEED = 5;

export interface PalaceSlot {
  corridorZ: number;
  side: "left" | "right";
  /** Door center in world space */
  door: [number, number, number];
  /** Room interior spawn (player) */
  spawn: [number, number, number];
  /** Room center for props */
  center: [number, number, number];
}

export function getPalaceSlot(index: number): PalaceSlot {
  const side: "left" | "right" = index % 2 === 0 ? "left" : "right";
  const corridorZ = -10 - index * DOOR_SPACING;
  const sign = side === "left" ? -1 : 1;
  const doorX = sign * (CORRIDOR_WIDTH / 2);
  const roomCenterX = sign * (CORRIDOR_WIDTH / 2 + ROOM_WIDTH / 2);
  return {
    corridorZ,
    side,
    door: [doorX, 0, corridorZ],
    spawn: [roomCenterX - sign * 1.2, PLAYER_EYE, corridorZ - 1.5],
    center: [roomCenterX, 0, corridorZ - 2],
  };
}

export function corridorEndZ(roomCount: number): number {
  return -10 - (roomCount - 1) * DOOR_SPACING - 6;
}
