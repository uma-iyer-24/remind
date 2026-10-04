import { Text } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { ROOM_DEPTH, ROOM_HEIGHT, ROOM_WIDTH } from "../../lib/palaceLayout";
import { wallTidbitsFor, type WallTidbit } from "../../lib/wallTidbits";
import type { ConceptState } from "../../types";
import WallTidbitObject from "./WallTidbitObject";
import {
  Armchair,
  Baseboard,
  CeilingMedallion,
  ChairRail,
  CrownMolding,
  HardwoodFloor,
  OrnateRug,
  StudyTable,
  Wainscoting,
  WindowWithCurtains,
} from "./interiorDecor";
import { palaceTheme as t } from "./palaceTheme";
import MemorySculpture from "./MemorySculpture";
import { conceptGlow } from "./PropMesh";
import { sculptureFor } from "../../lib/topicKnowledge";
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
  const tidbits = useMemo(() => wallTidbitsFor(concept), [concept]);
  const accent = concept.prop.color;
  const plaque = tidbits[0];

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
      <RoomShell glow={glow} />
      <WindowWithCurtains
        position={[0, 1.75, -ROOM_DEPTH / 2 + 0.18]}
        rotation={[0, -Math.PI / 2, 0]}
        curtainColor="#E4D5C4"
        paneColors={["#E7E1D6", "#D5DDD8", "#E7E1D6"]}
      />
      <group ref={portraitRef} position={[-ROOM_WIDTH / 2 + 0.28, 0.2, -1.2]} rotation={[0, Math.PI / 2, 0]} scale={0.62}>
        <PortraitFrame
          conceptId={concept.id}
          title={concept.title}
          accent={accent}
          highlight={glow}
          interactive={inside}
          onClick={onPortraitClick}
        />
      </group>
      <group position={[0, 0, 0]}>
        <OrnateRug width={1.8} depth={1.35} primary="#6B3A45" secondary="#C4B48A" border="#8A7355" />
      </group>
      <StudyTable position={[0, 0, 0]} />
      <group
        position={[0, 0.8, 0]}
        onClick={(e) => {
          e.stopPropagation();
          if (inside) onSelectPortrait();
        }}
      >
        <MemorySculpture kind={sculptureFor(concept.title)} glow={glow} />
        <Text
          position={[0, -0.18, 0.55]}
          fontSize={0.09}
          maxWidth={1.8}
          color="#3F3A34"
          anchorX="center"
          anchorY="middle"
          textAlign="center"
        >
          {concept.title.length > 42 ? `${concept.title.slice(0, 40)}…` : concept.title}
        </Text>
      </group>
      <Armchair position={[1.85, 0, 1.85]} rotation={[0, -0.9, 0]} fabric="#6E6256" />
      {inside && (
        <>
          <CeilingMedallion position={[0, ROOM_HEIGHT - 0.12, 0.2]} color={t.brass} />
          <pointLight position={[0, 2.5, 0.35]} intensity={0.55} color={t.lightWarm} distance={7} />
        </>
      )}
      {plaque && (
        <WallTidbitObject
          tidbit={plaque}
          position={[ROOM_WIDTH / 2 - 0.16, 1.7, -1.15]}
          rotation={[0, -Math.PI / 2, 0]}
          shape="plaque"
          interactive={inside}
          onSelect={onTidbitClick}
        />
      )}
      {(concept.encountered || concept.reviewCount > 0) && <ReviewedMark />}
      {inside && <ExitPlaque />}
    </group>
  );
}

function RoomShell({ glow }: { glow: boolean }) {
  const w = ROOM_WIDTH;
  const d = ROOM_DEPTH;
  const h = ROOM_HEIGHT;
  const wainscotH = 1.05;

  return (
    <group>
      <HardwoodFloor width={w} depth={d} />
      <mesh position={[0, h / 2, -d / 2]}>
        <boxGeometry args={[w, h, 0.12]} />
        <meshStandardMaterial color={t.wall} roughness={0.88} />
      </mesh>
      <Wainscoting
        width={w - 0.1}
        height={wainscotH}
        depth={0.06}
        position={[0, wainscotH / 2, -d / 2 + 0.08]}
        color={t.wainscot}
      />
      <ChairRail width={w - 0.15} depth={0.05} position={[0, wainscotH + 0.03, -d / 2 + 0.1]} color={t.trim} />
      <mesh position={[-w / 2, h / 2, 0]}>
        <boxGeometry args={[0.12, h, d]} />
        <meshStandardMaterial color={t.wall} roughness={0.88} />
      </mesh>
      <mesh position={[w / 2, h / 2, 0]}>
        <boxGeometry args={[0.12, h, d]} />
        <meshStandardMaterial color={t.wall} roughness={0.88} />
      </mesh>
      <Wainscoting width={0.14} height={wainscotH} depth={d - 0.2} position={[-w / 2 + 0.07, wainscotH / 2, 0]} />
      <Wainscoting width={0.14} height={wainscotH} depth={d - 0.2} position={[w / 2 - 0.07, wainscotH / 2, 0]} />
      <mesh position={[0, h, 0]}>
        <boxGeometry args={[w, 0.1, d]} />
        <meshStandardMaterial color={t.ceiling} roughness={0.92} />
      </mesh>
      <CrownMolding width={w - 0.25} depth={d - 0.2} position={[0, h - 0.12, 0]} color={t.trimHighlight} />
      <Baseboard width={d - 0.2} position={[-w / 2 + 0.06, 0.06, 0]} />
      <Baseboard width={d - 0.2} position={[w / 2 - 0.06, 0.06, 0]} />
      <mesh position={[-w / 4, h / 2, d / 2]}>
        <boxGeometry args={[w / 2 - 0.65, h, 0.1]} />
        <meshStandardMaterial color={t.wall} roughness={0.88} />
      </mesh>
      <mesh position={[w / 4, h / 2, d / 2]}>
        <boxGeometry args={[w / 2 - 0.65, h, 0.1]} />
        <meshStandardMaterial color={t.wall} roughness={0.88} />
      </mesh>
      <mesh position={[0, h * 0.82, d / 2]}>
        <boxGeometry args={[1.25, h * 0.35, 0.1]} />
        <meshStandardMaterial color={t.wall} roughness={0.88} />
      </mesh>
      <mesh position={[0, 0.04, d / 2 - 0.02]}>
        <boxGeometry args={[1.2, 0.06, 0.04]} />
        <meshStandardMaterial color={t.trim} roughness={0.65} metalness={0.05} />
      </mesh>
      {!glow && (
        <mesh position={[0, h - 0.32, 0]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial color="#FFF8E7" emissive="#FFE4A8" emissiveIntensity={0.25} />
        </mesh>
      )}
      {glow && (
        <pointLight position={[0, h - 0.35, 0]} intensity={0.25} color={t.lightWarm} distance={4} />
      )}
    </group>
  );
}

function ReviewedMark() {
  return (
    <group position={[0, 2.35, ROOM_DEPTH / 2 - 0.55]}>
      <mesh>
        <boxGeometry args={[1.15, 0.22, 0.03]} />
        <meshStandardMaterial color="#E7E1D6" roughness={0.9} />
      </mesh>
      <Text position={[0, 0, 0.02]} fontSize={0.07} color="#3E6B66" anchorX="center" anchorY="middle">
        Topic reviewed
      </Text>
    </group>
  );
}

function ExitPlaque() {
  return (
    <mesh position={[0, 2.12, ROOM_DEPTH / 2 - 0.48]}>
      <boxGeometry args={[0.5, 0.12, 0.02]} />
      <meshStandardMaterial color={t.brass} metalness={0.45} roughness={0.4} />
    </mesh>
  );
}
