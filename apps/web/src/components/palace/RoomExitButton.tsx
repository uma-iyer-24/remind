import { DoorOpen } from "lucide-react";
import type { ConceptState } from "../../types";
import { getRoomExitTarget } from "../../lib/palaceNavigation";
import { usePalaceNav } from "./palaceNav";

interface Props {
  concepts: ConceptState[];
}

export default function RoomExitButton({ concepts }: Props) {
  const nav = usePalaceNav();

  if (nav.zone !== "room" || !nav.roomId) return null;

  const exit = () => {
    const target = getRoomExitTarget(concepts, nav.roomId!);
    if (target) nav.exitRoom(target.corridorPos, target.yaw);
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 top-20 z-20 flex justify-center px-4 md:top-24 md:justify-end md:pr-6">
      <button
        type="button"
        onClick={exit}
        className="pointer-events-auto flex items-center gap-2 rounded-xl border-2 border-teal-300/90 bg-teal-950/90 px-4 py-2.5 text-sm font-semibold text-teal-50 shadow-lg backdrop-blur-sm transition hover:bg-teal-900 hover:border-teal-200 md:text-base"
      >
        <DoorOpen className="h-5 w-5 shrink-0" aria-hidden />
        Leave room
      </button>
    </div>
  );
}
