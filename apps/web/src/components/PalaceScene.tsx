import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import type { WallTidbit } from "../lib/wallTidbits";
import type { ConceptState } from "../types";
import MemoryPalaceWorld from "./palace/MemoryPalaceWorld";
import { palaceTheme as t } from "./palace/palaceTheme";
import PalaceInteractions from "./palace/PalaceInteractions";
import { PalaceNavProvider, usePalaceNav } from "./palace/palaceNav";
import PlayerController from "./palace/PlayerController";
import RenderBudget from "./palace/RenderBudget";
import RoomExitButton from "./palace/RoomExitButton";
import type { PalaceHudState } from "./palace/PalaceHud";

interface Props {
  concepts: ConceptState[];
  selectedId: string | null;
  uiBlocking: boolean;
  onSelect: (id: string) => void;
  onTidbitClick: (tidbit: WallTidbit) => void;
  onPortraitClick: (conceptId: string) => void;
  onOpenFinale: () => void;
  onHudChange: (state: PalaceHudState | null) => void;
}

function PromptReporter({ onHudChange }: { onHudChange: (state: PalaceHudState | null) => void }) {
  const nav = usePalaceNav();

  useEffect(() => {
    if (nav.nearDoor) {
      onHudChange({
        zone: nav.zone === "hall" ? "hall" : "corridor",
        contextMessage: `Press E to enter — ${nav.nearDoor.title}`,
        emphasis: "action",
      });
      return;
    }
    if (nav.zone === "room" && nav.nearPortrait) {
      onHudChange({
        zone: "room",
        contextMessage: `Press E to study — ${nav.nearPortrait.title}`,
        emphasis: "action",
      });
      return;
    }
    if (nav.zone === "hall") {
      onHudChange({
        zone: "hall",
        contextMessage: "Walk ahead. Each door is one topic.",
        emphasis: "normal",
      });
      return;
    }
    if (nav.zone === "room") {
      onHudChange({
        zone: "room",
        contextMessage: "The portrait is on the left. Press E to study, or L to leave.",
        emphasis: "normal",
      });
      return;
    }
    onHudChange({
      zone: "corridor",
      contextMessage: "Study doors line the hall. Press E to enter.",
      emphasis: "normal",
    });
  }, [nav.zone, nav.nearDoor, nav.nearPortrait, onHudChange]);

  return null;
}

function SceneContent({
  concepts,
  selectedId,
  onSelect,
  onTidbitClick,
  onPortraitClick,
  onOpenFinale,
  onHudChange,
  renderActive,
}: Omit<Props, "uiBlocking"> & { renderActive: boolean }) {
  return (
    <>
      <RenderBudget renderActive={renderActive} />
      <color attach="background" args={[t.sky]} />
      <fog attach="fog" args={[t.sky, t.fogNear, t.fogFar]} />
      <ambientLight intensity={0.78} color="#FFF5EB" />
      <directionalLight position={[4, 12, 8]} intensity={0.62} color="#FFFBF5" />
      <hemisphereLight args={["#BAE6FD", t.floorWoodDark, 0.5]} />
      <PlayerController roomCount={concepts.length} />
      <MemoryPalaceWorld
        concepts={concepts}
        selectedId={selectedId}
        onSelectConcept={onSelect}
        onTidbitClick={onTidbitClick}
        onPortraitClick={onPortraitClick}
      />
      <PalaceInteractions concepts={concepts} onOpenPortrait={onPortraitClick} onOpenFinale={onOpenFinale} />
      <PromptReporter onHudChange={onHudChange} />
    </>
  );
}

export default function PalaceScene({
  concepts,
  selectedId,
  uiBlocking,
  onSelect,
  onTidbitClick,
  onPortraitClick,
  onOpenFinale,
  onHudChange,
}: Props) {
  return (
    <PalaceNavProvider>
      <div className="relative h-full w-full">
        <Canvas
          dpr={[1, 1]}
          gl={{ powerPreference: "default", antialias: false }}
          camera={{ fov: 70, near: 0.1, far: 55 }}
          className="h-full w-full touch-none"
        >
          <Suspense fallback={null}>
            <SceneContent
              concepts={concepts}
              selectedId={selectedId}
              onSelect={onSelect}
              onTidbitClick={onTidbitClick}
              onPortraitClick={onPortraitClick}
              onOpenFinale={onOpenFinale}
              onHudChange={onHudChange}
              renderActive={!uiBlocking}
            />
          </Suspense>
        </Canvas>
        {!uiBlocking && <RoomExitButton concepts={concepts} />}
      </div>
      {uiBlocking && <div className="pointer-events-none fixed inset-0 z-[9999]" aria-hidden />}
    </PalaceNavProvider>
  );
}
