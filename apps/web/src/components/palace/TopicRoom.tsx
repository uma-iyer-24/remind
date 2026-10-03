import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { ROOM_DEPTH, ROOM_HEIGHT, ROOM_WIDTH } from "../../lib/palaceLayout";
import { wallTidbitsFor, type WallTidbit } from "../../lib/wallTidbits";
import type { ConceptState } from "../../types";
import WallTidbitObject from "./WallTidbitObject";
import { accentAt, roomPalette } from "./colorUtils";
import {
  Armchair,
  Baseboard,
  Bookshelf,
  CeilingMedallion,
  ChairRail,
  Chandelier,
  ColorfulPainting,
  CrownMolding,
  FireplaceMantel,
  FloorLamp,
  HardwoodFloor,
  OrnateRug,
  PottedPlant,
  StudyTable,
  Wainscoting,
  WindowWithCurtains,
} from "./interiorDecor";
import { palaceTheme as t } from "./palaceTheme";
import PropMesh, { conceptGlow } from "./PropMesh";
import PortraitFrame from "./PortraitFrame";
import { setNearPortraitIfChanged, usePalaceNav } from "./palaceNav";

interface Props {
  concept: ConceptState;
  worldPosition: [number, number, number];
  facingCorridor: number;
  selected: boolean;
  onSelectPortrait: () => void;
  onTidbitClick: (tidbit: WallTidbit) => void;
  onPortraitClick: () => void;
}

export default function TopicRoom({
  concept,
  worldPosition,
  facingCorridor,
  selected,
  onSelectPortrait,
  onTidbitClick,
  onPortraitClick,
}: Props) {
  const nav = usePalaceNav();
  const { camera } = useThree();
  const portraitRef = useRef<THREE.Group>(null);
  const portraitWorld = useRef(new THREE.Vector3());
  const zoneRef = useRef(nav.zone);
  const roomIdRef = useRef(nav.roomId);
  const nearPortraitRef = useRef(nav.nearPortrait);
  zoneRef.current = nav.zone;
  roomIdRef.current = nav.roomId;
  nearPortraitRef.current = nav.nearPortrait;
  const glow = conceptGlow(concept, selected);
  const inside = nav.zone === "room" && nav.roomId === concept.id;
  const palette = useMemo(
    () => roomPalette(concept.prop.color, !inside),
    [concept.prop.color, inside],
  );
  const tidbits = useMemo(() => wallTidbitsFor(concept), [concept]);
  const accent = concept.prop.color;

  useFrame(() => {
    const inThisRoom = zoneRef.current === "room" && roomIdRef.current === concept.id;
    if (!inThisRoom) {
      if (nearPortraitRef.current?.conceptId === concept.id) {
        setNearPortraitIfChanged(nearPortraitRef.current, null, nav.setNearPortrait);
      }
      return;
    }
    if (!portraitRef.current) return;
    portraitRef.current.getWorldPosition(portraitWorld.current);
    const dist = camera.position.distanceTo(portraitWorld.current);
    setNearPortraitIfChanged(
      nearPortraitRef.current,
      dist < 2.5 ? { conceptId: concept.id, title: concept.title } : null,
      nav.setNearPortrait,
    );
  });

  return (
    <group position={worldPosition} rotation={[0, facingCorridor, 0]}>
      <RoomShell palette={palette} accent={accent} glow={glow} />
      <group position={[0, 0, -ROOM_DEPTH / 2 + 0.55]}>
        <FireplaceMantel width={2.4} tileColor={accent} />
      </group>
      <group ref={portraitRef} position={[0, 0, -ROOM_DEPTH / 2 + 0.45]}>
        <PortraitFrame
          conceptId={concept.id}
          title={concept.title}
          accent={accent}
          highlight={glow}
          interactive={inside}
          onClick={onPortraitClick}
        />
      </group>
      <Bookshelf position={[-ROOM_WIDTH / 2 + 0.45, 0, -0.5]} rotation={[0, Math.PI / 2, 0]} />
      <Bookshelf position={[ROOM_WIDTH / 2 - 0.45, 0, 0.3]} rotation={[0, -Math.PI / 2, 0]} />
      <WindowWithCurtains
        position={[-ROOM_WIDTH / 2 + 0.12, 1.35, 1.2]}
        rotation={[0, Math.PI / 2, 0]}
        curtainColor={palette.curtain}
        paneColors={[accentAt(0), accentAt(2), accentAt(4)]}
      />
      <WindowWithCurtains
        position={[ROOM_WIDTH / 2 - 0.12, 1.35, -1]}
        rotation={[0, -Math.PI / 2, 0]}
        curtainColor={palette.curtain}
        paneColors={[accentAt(1), accentAt(3), accentAt(5)]}
      />
      <ColorfulPainting
        position={[-ROOM_WIDTH / 2 + 0.14, 1.9, 0.2]}
        rotation={[0, Math.PI / 2, 0]}
        colors={[accent, accentAt(7), accentAt(9)]}
        scale={0.95}
      />
      <ColorfulPainting
        position={[ROOM_WIDTH / 2 - 0.14, 1.9, -0.3]}
        rotation={[0, -Math.PI / 2, 0]}
        colors={[accentAt(6), accent, accentAt(8)]}
        scale={0.95}
      />
      <group position={[0, 0, 0.5]}>
        <OrnateRug width={2.9} depth={2.3} primary={palette.rug} secondary={accent} border={t.brass} />
      </group>
      <StudyTable position={[0, 0, 0.85]} />
      <group
        position={[0, 1.12, 0.85]}
        onClick={(e) => {
          e.stopPropagation();
          if (inside) onSelectPortrait();
        }}
      >
        <PropMesh shape={concept.prop.shape} color={accent} glow={glow} scale={0.85} />
      </group>
      <Armchair position={[-1.35, 0, 1.1]} rotation={[0, 0.35, 0]} fabric={palette.upholstery} />
      <Armchair position={[1.2, 0, -0.6]} rotation={[0, -2.4, 0]} fabric={palette.curtain} />
      <PottedPlant position={[1.45, 0, 1.35]} potColor={accent} />
      <FloorLamp position={[-1.5, 0, -1.2]} shade={accent} />
      {inside && (
        <>
          <Chandelier position={[0, ROOM_HEIGHT - 0.25, 0]} gemColor={accent} />
          <CeilingMedallion position={[0, ROOM_HEIGHT - 0.12, 0]} color={t.brass} />
          <pointLight position={[0, 2.4, 0]} intensity={0.5} color={t.lightWarm} distance={7} />
        </>
      )}
      {tidbits[0] && (
        <WallTidbitObject
          tidbit={tidbits[0]}
          position={[-ROOM_WIDTH / 2 + 0.2, 1.55, -0.8]}
          rotation={[0, Math.PI / 2, 0]}
          accent={accent}
          shape="plaque"
          interactive={inside}
          onSelect={onTidbitClick}
        />
      )}
      {tidbits[1] && (
        <WallTidbitObject
          tidbit={tidbits[1]}
          position={[ROOM_WIDTH / 2 - 0.2, 1.65, 0.6]}
          rotation={[0, -Math.PI / 2, 0]}
          accent={accent}
          shape="scroll"
          interactive={inside}
          onSelect={onTidbitClick}
        />
      )}
      {tidbits[2] && (
        <WallTidbitObject
          tidbit={tidbits[2]}
          position={[1.4, 1.45, -ROOM_DEPTH / 2 + 0.15]}
          accent={accent}
          shape="gem"
          interactive={inside}
          onSelect={onTidbitClick}
        />
      )}
      {inside && <ExitPlaque accent={accent} />}
    </group>
  );
}

function RoomShell({
  palette,
  accent,
  glow,
}: {
  palette: ReturnType<typeof roomPalette>;
  accent: string;
  glow: boolean;
}) {
  const w = ROOM_WIDTH;
  const d = ROOM_DEPTH;
  const h = ROOM_HEIGHT;
  const wainscotH = 1.05;

  return (
    <group>
      <HardwoodFloor width={w} depth={d} />
      <mesh position={[0, h / 2, -d / 2]}>
        <boxGeometry args={[w, h, 0.12]} />
        <meshStandardMaterial color={palette.wallpaper} roughness={0.88} />
      </mesh>
      <Wainscoting
        width={w - 0.1}
        height={wainscotH}
        depth={0.06}
        position={[0, wainscotH / 2, -d / 2 + 0.08]}
        color={palette.wainscot}
      />
      <ChairRail width={w - 0.15} depth={0.05} position={[0, wainscotH + 0.03, -d / 2 + 0.1]} color={accent} />
      <mesh position={[-w / 2, h / 2, 0]}>
        <boxGeometry args={[0.12, h, d]} />
        <meshStandardMaterial color={palette.side} roughness={0.88} />
      </mesh>
      <mesh position={[w / 2, h / 2, 0]}>
        <boxGeometry args={[0.12, h, d]} />
        <meshStandardMaterial color={palette.side} roughness={0.88} />
      </mesh>
      <Wainscoting width={0.14} height={wainscotH} depth={d - 0.2} position={[-w / 2 + 0.07, wainscotH / 2, 0]} />
      <Wainscoting width={0.14} height={wainscotH} depth={d - 0.2} position={[w / 2 - 0.07, wainscotH / 2, 0]} />
      <mesh position={[0, h, 0]}>
        <boxGeometry args={[w, 0.1, d]} />
        <meshStandardMaterial color={palette.ceiling} roughness={0.92} />
      </mesh>
      <CrownMolding width={w - 0.25} depth={d - 0.2} position={[0, h - 0.12, 0]} color={t.trimHighlight} />
      <Baseboard width={d - 0.2} position={[-w / 2 + 0.06, 0.06, 0]} />
      <Baseboard width={d - 0.2} position={[w / 2 - 0.06, 0.06, 0]} />
      <mesh position={[-w / 4, h / 2, d / 2]}>
        <boxGeometry args={[w / 2 - 0.65, h, 0.1]} />
        <meshStandardMaterial color={palette.side} roughness={0.88} />
      </mesh>
      <mesh position={[w / 4, h / 2, d / 2]}>
        <boxGeometry args={[w / 2 - 0.65, h, 0.1]} />
        <meshStandardMaterial color={palette.side} roughness={0.88} />
      </mesh>
      <mesh position={[0, h * 0.82, d / 2]}>
        <boxGeometry args={[1.25, h * 0.35, 0.1]} />
        <meshStandardMaterial color={palette.back} roughness={0.88} />
      </mesh>
      <mesh position={[0, 0.04, d / 2 - 0.02]}>
        <boxGeometry args={[1.2, 0.06, 0.04]} />
        <meshStandardMaterial color={palette.trim} roughness={0.65} metalness={0.05} />
      </mesh>
      {!glow && (
        <mesh position={[0, h - 0.32, 0]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial color="#FFF8E7" emissive="#FFE4A8" emissiveIntensity={0.25} />
        </mesh>
      )}
      {glow && (
        <pointLight position={[0, h - 0.35, 0]} intensity={0.3} color={accent} distance={4} />
      )}
    </group>
  );
}

function ExitPlaque({ accent }: { accent: string }) {
  return (
    <mesh position={[0, 2.12, ROOM_DEPTH / 2 - 0.48]}>
      <boxGeometry args={[0.5, 0.12, 0.02]} />
      <meshStandardMaterial color={t.brass} emissive={accent} emissiveIntensity={0.15} metalness={0.6} roughness={0.35} />
    </mesh>
  );
}
