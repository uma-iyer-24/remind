import { Text } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { createPortraitTexture } from "../../lib/portraitArt";
import { getPortraitMeta } from "../../lib/portraitInfo";
import * as THREE from "three";
import { getPalaceSlot, CORRIDOR_WIDTH, corridorEndZ, ROOM_HEIGHT } from "../../lib/palaceLayout";
import type { WallTidbit } from "../../lib/wallTidbits";
import type { ConceptState } from "../../types";
import { mixHex } from "./colorUtils";
import GrandHall from "./GrandHall";
import {
  ChairRail,
  CrownMolding,
  HardwoodFloor,
  OrnateRug,
  PaintedWall,
  WallSconce,
  Wainscoting,
} from "./interiorDecor";
import { palaceTheme as t } from "./palaceTheme";
import TopicRoom from "./TopicRoom";
import { setNearDoorIfChanged, usePalaceNav } from "./palaceNav";

interface Props {
  concepts: ConceptState[];
  selectedId: string | null;
  onSelectConcept: (id: string) => void;
  onTidbitClick: (tidbit: WallTidbit) => void;
  onPortraitClick: (conceptId: string) => void;
}

export default function MemoryPalaceWorld({
  concepts,
  selectedId,
  onSelectConcept,
  onTidbitClick,
  onPortraitClick,
}: Props) {
  const nav = usePalaceNav();
  const zoneRef = useRef(nav.zone);
  zoneRef.current = nav.zone;
  const nearDoorRef = useRef(nav.nearDoor);
  nearDoorRef.current = nav.nearDoor;
  const { camera } = useThree();
  const doorProbe = useRef(new THREE.Vector3());
  const ordered = useMemo(
    () => [...concepts].sort((a, b) => a.pathIndex - b.pathIndex),
    [concepts],
  );

  const rooms = useMemo(
    () =>
      ordered.map((concept, index) => {
        const slot = getPalaceSlot(index);
        const facing = slot.side === "left" ? -Math.PI / 2 : Math.PI / 2;
        return { concept, slot, facing, index };
      }),
    [ordered],
  );

  useFrame(() => {
    const zone = zoneRef.current;
    if (zone !== "corridor" && zone !== "hall") {
      setNearDoorIfChanged(nearDoorRef.current, null, nav.setNearDoor);
      return;
    }

    let closest: { conceptId: string; title: string; dist: number } | null = null;
    for (const { concept, slot } of rooms) {
      doorProbe.current.set(slot.door[0], 1.65, slot.door[2]);
      const dist = camera.position.distanceTo(doorProbe.current);
      if (dist < 3.2 && (!closest || dist < closest.dist)) {
        closest = { conceptId: concept.id, title: concept.title, dist };
      }
    }

    const finaleZ = corridorEndZ(rooms.length) + 2;
    doorProbe.current.set(0, 1.65, finaleZ);
    const finaleDist = camera.position.distanceTo(doorProbe.current);
    if (finaleDist < 3.4 && (!closest || finaleDist < closest.dist)) {
      closest = { conceptId: "__finale__", title: "Final review", dist: finaleDist };
    }

    setNearDoorIfChanged(
      nearDoorRef.current,
      closest ? { conceptId: closest.conceptId, title: closest.title } : null,
      nav.setNearDoor,
    );
  });

  const endZ = corridorEndZ(rooms.length);

  return (
    <group>
      <GrandHall />
      <Corridor endZ={endZ} />
      <FinaleMark position={[0, 0, endZ + 2]} />

      {rooms.map(({ concept, slot, facing, index }) => (
        <group key={concept.id}>
          <DoorFrame
            conceptId={concept.id}
            position={slot.door}
            title={concept.title}
            highlight={concept.forgetProbability > 0.55 || concept.id === selectedId}
            accent={concept.prop.color}
            side={slot.side}
            index={index}
          />
          <TopicRoom
            concept={concept}
            worldPosition={[slot.center[0], 0, slot.center[2]]}
            facingCorridor={facing}
            selected={concept.id === selectedId}
            onSelectPortrait={() => onSelectConcept(concept.id)}
            onTidbitClick={onTidbitClick}
            onPortraitClick={() => onPortraitClick(concept.id)}
          />
        </group>
      ))}
    </group>
  );
}

function Corridor({ endZ }: { endZ: number }) {
  const length = Math.abs(endZ) + 8;
  const midZ = (2 + endZ) / 2;
  const h = ROOM_HEIGHT;
  const segmentLen = 5;
  const segments = Math.ceil(length / segmentLen);
  const wainscotH = 1.05;

  return (
    <group position={[0, 0, midZ]}>
      <HardwoodFloor width={CORRIDOR_WIDTH + 0.4} depth={length} />
      <OrnateRug
        width={1.15}
        depth={length - 2}
        primary="#6B3A45"
        secondary="#C4B48A"
        border="#8A7355"
      />

      <mesh position={[0, h - 0.06, 0]}>
        <boxGeometry args={[CORRIDOR_WIDTH + 0.35, 0.1, length]} />
        <meshStandardMaterial color={t.ceiling} roughness={0.9} />
      </mesh>
      <CrownMolding width={CORRIDOR_WIDTH + 0.2} depth={length - 0.3} position={[0, h - 0.18, 0]} />

      {Array.from({ length: segments }).map((_, i) => {
        const z = -length / 2 + (i + 0.5) * segmentLen;
        return (
          <group key={i} position={[0, 0, z]}>
            <PaintedWall
              width={0.14}
              height={h}
              depth={segmentLen - 0.1}
              position={[-CORRIDOR_WIDTH / 2 - 0.07, h / 2, 0]}
              color={t.wall}
            />
            <PaintedWall
              width={0.14}
              height={h}
              depth={segmentLen - 0.1}
              position={[CORRIDOR_WIDTH / 2 + 0.07, h / 2, 0]}
              color={t.wall}
            />
            <ChairRail
              width={0.16}
              depth={segmentLen - 0.12}
              position={[-CORRIDOR_WIDTH / 2 - 0.06, wainscotH + 0.03, 0]}
              color={t.trim}
            />
            <ChairRail
              width={0.16}
              depth={segmentLen - 0.12}
              position={[CORRIDOR_WIDTH / 2 + 0.06, wainscotH + 0.03, 0]}
              color={t.trim}
            />
            <Wainscoting
              width={0.16}
              height={wainscotH}
              depth={segmentLen - 0.12}
              position={[-CORRIDOR_WIDTH / 2 - 0.06, wainscotH / 2, 0]}
            />
            <Wainscoting
              width={0.16}
              height={wainscotH}
              depth={segmentLen - 0.12}
              position={[CORRIDOR_WIDTH / 2 + 0.06, wainscotH / 2, 0]}
            />
            <mesh position={[-CORRIDOR_WIDTH / 2 - 0.02, 0.06, 0]}>
              <boxGeometry args={[0.06, 0.12, segmentLen - 0.15]} />
              <meshStandardMaterial color={t.trim} roughness={0.72} />
            </mesh>
            <mesh position={[CORRIDOR_WIDTH / 2 + 0.02, 0.06, 0]}>
              <boxGeometry args={[0.06, 0.12, segmentLen - 0.15]} />
              <meshStandardMaterial color={t.trim} roughness={0.72} />
            </mesh>
            {i % 3 === 0 && (
              <WallSconce
                position={[i % 2 === 0 ? -CORRIDOR_WIDTH / 2 - 0.1 : CORRIDOR_WIDTH / 2 + 0.1, 1.55, 0]}
                rotation={[0, i % 2 === 0 ? Math.PI / 2 : -Math.PI / 2, 0]}
                shadeColor="#E7D7B8"
              />
            )}
          </group>
        );
      })}
      {HALL_QUOTES.map((quote, i) => {
        const z = -length / 2 + 6 + i * Math.max(6, (length - 8) / HALL_QUOTES.length);
        const side = i % 2 === 0 ? -1 : 1;
        return (
          <group key={quote} position={[side * (CORRIDOR_WIDTH / 2 - 0.02), 1.7, z]} rotation={[0, side > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}>
            <mesh>
              <planeGeometry args={[1.7, 0.42]} />
              <meshStandardMaterial color="#F6F1E8" roughness={0.9} />
            </mesh>
            <Text position={[0, 0, 0.02]} fontSize={0.055} maxWidth={1.5} color="#4A3728" anchorX="center" anchorY="middle" textAlign="center">
              {quote}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

const HALL_QUOTES = [
  "Small steps become lasting memories.",
  "Recall is stronger than rereading.",
  "Learn it. Place it. Remember it.",
  "Your brain remembers stories, not lists.",
  "One concept at a time.",
];

function FinaleMark({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.15, 0]}>
        <boxGeometry args={[1.6, 2.2, 0.12]} />
        <meshStandardMaterial color="#E7E1D6" roughness={0.85} />
      </mesh>
      <Text position={[0, 1.35, 0.08]} fontSize={0.1} maxWidth={1.3} color="#3F3A34" anchorX="center" textAlign="center">
        Final review
      </Text>
      <Text position={[0, 1.05, 0.08]} fontSize={0.05} maxWidth={1.3} color="#6B5E52" anchorX="center" textAlign="center">
        Press E
      </Text>
    </group>
  );
}

function DoorFrame({
  conceptId,
  position,
  title,
  highlight,
  accent,
  side,
  index,
}: {
  conceptId: string;
  position: [number, number, number];
  title: string;
  highlight: boolean;
  accent: string;
  side: "left" | "right";
  index: number;
}) {
  const sign = side === "left" ? -1 : 1;
  void index;
  const rotY = side === "left" ? Math.PI / 2 : -Math.PI / 2;
  const faceRot = side === "left" ? Math.PI / 2 : -Math.PI / 2;
  const faceX = side === "left" ? 0.62 : -0.62;
  const frameColor = t.doorFrame;
  const doorColor = t.door;
  const panelInset = mixHex(t.door, t.wallShadow, 0.12);
  const texture = useMemo(
    () => createPortraitTexture(conceptId, title, accent),
    [conceptId, title, accent],
  );
  const subtitle = getPortraitMeta(conceptId, title).subtitle;
  const doorTitle = title.length > 28 ? `${title.slice(0, 26)}…` : title;

  return (
    <group position={[position[0] + sign * 0.12, 0, position[2]]}>
      <mesh position={[0, 1.08, 0]} rotation={[0, rotY, 0]}>
        <boxGeometry args={[1.52, 2.42, 0.14]} />
        <meshStandardMaterial color={frameColor} roughness={0.68} metalness={0.02} />
      </mesh>
      <mesh position={[0, 1.05, sign * 0.04]} rotation={[0, rotY, 0]}>
        <boxGeometry args={[1.2, 2.1, 0.08]} />
        <meshStandardMaterial color={doorColor} roughness={0.82} metalness={0} />
      </mesh>
      {[1.55, 1.05, 0.55].map((y) => (
        <group key={y}>
          <mesh position={[0, y, sign * 0.085]} rotation={[0, rotY, 0]}>
            <boxGeometry args={[0.92, 0.38, 0.02]} />
            <meshStandardMaterial color={panelInset} roughness={0.85} />
          </mesh>
          <mesh position={[0, y, sign * 0.092]} rotation={[0, rotY, 0]}>
            <boxGeometry args={[0.88, 0.04, 0.01]} />
            <meshStandardMaterial color={accent} roughness={0.5} emissive={accent} emissiveIntensity={0.12} />
          </mesh>
        </group>
      ))}

      {/* Corridor-facing plaque: image + labels (visible when walking the hall) */}
      <group position={[faceX, 1.38, 0]} rotation={[0, faceRot, 0]}>
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[1.02, 1.22]} />
          <meshStandardMaterial color={t.trimHighlight} roughness={0.55} metalness={0.08} />
        </mesh>
        <mesh position={[0, 0.08, 0.01]}>
          <planeGeometry args={[0.88, 0.82]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
        <mesh position={[0, -0.48, 0.015]}>
          <planeGeometry args={[0.94, 0.28]} />
          <meshStandardMaterial color={mixHex(accent, "#FFFFFF", 0.2)} roughness={0.45} />
        </mesh>
        <Text
          position={[0, -0.42, 0.03]}
          fontSize={0.055}
          maxWidth={0.88}
          color="#1E1B4B"
          anchorX="center"
          anchorY="middle"
          textAlign="center"
          outlineWidth={0.004}
          outlineColor="#FFFFFF"
        >
          {doorTitle}
        </Text>
        <Text
          position={[0, -0.58, 0.03]}
          fontSize={0.038}
          maxWidth={0.88}
          color="#5B21B6"
          anchorX="center"
          anchorY="middle"
          textAlign="center"
        >
          {subtitle}
        </Text>
      </group>

      {/* In-room door face (same art when inside / on the jamb) */}
      <mesh position={[0, 1.42, sign * 0.062]} rotation={[0, rotY, 0]}>
        <planeGeometry args={[0.72, 0.68]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <Text
        position={[0, 0.78, sign * 0.068]}
        rotation={[0, rotY, 0]}
        fontSize={0.048}
        maxWidth={1.02}
        color="#1E1B4B"
        anchorX="center"
        anchorY="middle"
        textAlign="center"
        outlineWidth={0.003}
        outlineColor="#FFF"
      >
        {doorTitle}
      </Text>

      <mesh position={[0, 1.02, sign * 0.09]} rotation={[0, rotY, 0]}>
        <sphereGeometry args={[0.055, 12, 12]} />
        <meshStandardMaterial color={t.brass} metalness={0.75} roughness={0.28} />
      </mesh>
      {highlight && (
        <mesh position={[0, 2.02, sign * 0.09]} rotation={[0, rotY, 0]}>
          <boxGeometry args={[1.24, 0.08, 0.02]} />
          <meshStandardMaterial color={t.brass} emissive="#D4AF37" emissiveIntensity={0.35} />
        </mesh>
      )}
      <mesh position={[0, 2.12, sign * 0.09]} rotation={[0, rotY, 0]}>
        <planeGeometry args={[1.26, 0.2]} />
        <meshStandardMaterial color={t.trim} roughness={0.6} />
      </mesh>
      <Text
        position={[0, 2.12, sign * 0.105]}
        rotation={[0, rotY, 0]}
        fontSize={0.065}
        maxWidth={1.15}
        color="#FAF6EF"
        anchorX="center"
        anchorY="middle"
        textAlign="center"
      >
        {doorTitle}
      </Text>
      <Text
        position={[0, 1.96, sign * 0.105]}
        rotation={[0, rotY, 0]}
        fontSize={0.035}
        maxWidth={1.1}
        color={highlight ? "#FDE68A" : "#D6CFC4"}
        anchorX="center"
        anchorY="middle"
        textAlign="center"
      >
        Press E to enter
      </Text>
    </group>
  );
}
