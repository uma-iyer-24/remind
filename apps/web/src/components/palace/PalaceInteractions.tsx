import { useEffect } from "react";
import { getPalaceSlot } from "../../lib/palaceLayout";
import { getRoomExitTarget } from "../../lib/palaceNavigation";
import type { ConceptState } from "../../types";
import { usePalaceNav } from "./palaceNav";

interface Props {
  concepts: ConceptState[];
  onOpenPortrait: (id: string) => void;
}

export default function PalaceInteractions({ concepts, onOpenPortrait }: Props) {
  const nav = usePalaceNav();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "KeyE") return;
      const ordered = [...concepts].sort((a, b) => a.pathIndex - b.pathIndex);

      if (nav.zone === "hall" && nav.playerPosRef.current.z < 1) {
        nav.teleport([0, 1.65, 0], Math.PI, "corridor", null);
        return;
      }

      if (nav.nearDoor && (nav.zone === "corridor" || nav.zone === "hall")) {
        const idx = ordered.findIndex((c) => c.id === nav.nearDoor!.conceptId);
        if (idx < 0) return;
        const slot = getPalaceSlot(idx);
        const face = slot.side === "left" ? -Math.PI / 2 : Math.PI / 2;
        nav.enterRoom(nav.nearDoor.conceptId, slot.spawn, face + Math.PI, slot.center);
        return;
      }

      if (nav.zone === "room" && nav.nearPortrait) {
        onOpenPortrait(nav.nearPortrait.conceptId);
        return;
      }

      if (nav.zone === "room" && nav.roomId) {
        const target = getRoomExitTarget(concepts, nav.roomId);
        if (target) nav.exitRoom(target.corridorPos, target.yaw);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [concepts, nav, onOpenPortrait]);

  return null;
}
