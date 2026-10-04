import { Text } from "@react-three/drei";
import { HALL_LENGTH, HALL_WIDTH, ROOM_HEIGHT } from "../../lib/palaceLayout";
import {
  Baseboard,
  CeilingMedallion,
  Chandelier,
  ClassicalColumn,
  ConsoleTable,
  CrownMolding,
  FloorLamp,
  HardwoodFloor,
  OrnateRug,
  PaintedWall,
  PottedPlant,
  Wainscoting,
  ChairRail,
} from "./interiorDecor";
import { palaceTheme as t } from "./palaceTheme";

const CORRIDOR_OPENING = 3.2;

export default function GrandHall() {
  const w = HALL_WIDTH;
  const l = HALL_LENGTH;
  const h = ROOM_HEIGHT + 1.2;
  const backZ = -l / 2 + 0.5;
  const sidePanelW = (w - CORRIDOR_OPENING) / 2;
  const wainscotH = 1.05;

  return (
    <group>
      <HardwoodFloor width={w} depth={l} />
      <group position={[0, 0, 1.2]}>
        <OrnateRug width={4.2} depth={5.2} primary="#6B3A45" secondary="#C4B48A" border="#8A7355" />
      </group>

      <PaintedWall width={0.18} height={h} depth={l} position={[-w / 2, h / 2, l / 4]} color={t.wall} />
      <PaintedWall width={0.18} height={h} depth={l} position={[w / 2, h / 2, l / 4]} color={t.wall} />
      <Wainscoting width={0.2} height={wainscotH} depth={l} position={[-w / 2 + 0.02, wainscotH / 2, l / 4]} />
      <Wainscoting width={0.2} height={wainscotH} depth={l} position={[w / 2 - 0.02, wainscotH / 2, l / 4]} />
      <ChairRail width={0.22} depth={l} position={[-w / 2 + 0.03, wainscotH + 0.03, l / 4]} color={t.trim} />
      <ChairRail width={0.22} depth={l} position={[w / 2 - 0.03, wainscotH + 0.03, l / 4]} color={t.trim} />

      <QuietPlaque
        position={[-w / 2 + 0.16, 1.85, 1.2]}
        rotation={[0, Math.PI / 2, 0]}
        title="One concept"
        line="Place it, then walk on."
      />
      <QuietPlaque
        position={[w / 2 - 0.16, 1.85, 1.2]}
        rotation={[0, -Math.PI / 2, 0]}
        title="Recall"
        line="Stronger than rereading."
      />

      <PaintedWall
        width={sidePanelW}
        height={h}
        depth={0.18}
        position={[-(CORRIDOR_OPENING / 2 + sidePanelW / 2), h / 2, backZ]}
        color={t.wall}
      />
      <PaintedWall
        width={sidePanelW}
        height={h}
        depth={0.18}
        position={[CORRIDOR_OPENING / 2 + sidePanelW / 2, h / 2, backZ]}
        color={t.wall}
      />
      <mesh position={[0, h * 0.72, backZ + 0.06]}>
        <boxGeometry args={[CORRIDOR_OPENING + 0.35, 0.22, 0.14]} />
        <meshStandardMaterial color={t.trim} roughness={0.62} />
      </mesh>

      <mesh position={[0, h - 0.08, l / 4]}>
        <boxGeometry args={[w - 0.4, 0.12, l - 0.5]} />
        <meshStandardMaterial color={t.ceiling} roughness={0.92} />
      </mesh>
      <CrownMolding width={w - 0.5} depth={l - 0.5} position={[0, h - 0.22, l / 4]} color={t.trimHighlight} />
      <CeilingMedallion position={[0, h - 0.14, 1.5]} color={t.brass} />
      <Baseboard width={w - 0.3} position={[0, 0.06, l / 4 - l / 2 + 0.2]} />
      <Baseboard width={w - 0.3} position={[0, 0.06, l / 4 + l / 2 - 0.2]} />

      <ClassicalColumn position={[-3.2, 0, 0.5]} capitalColor={t.brass} />
      <ClassicalColumn position={[3.2, 0, 0.5]} capitalColor={t.brass} />
      <Chandelier position={[0, h - 0.35, 1.5]} gemColor="#C4B48A" quiet />
      <group position={[-4.15, 0, 2.4]} rotation={[0, Math.PI / 2, 0]}>
        <ConsoleTable position={[0, 0, 0]} />
      </group>
      <PottedPlant position={[-4.2, 0, 2.2]} potColor="#6B4E32" />
      <PottedPlant position={[4.2, 0, 2.2]} potColor="#6B4E32" />
      <FloorLamp position={[-2.2, 0, 4]} shade="#E7D7B8" />
      <FloorLamp position={[2.2, 0, 4]} shade="#E7D7B8" />

      <Text position={[0, 2.75, 3.35]} fontSize={0.22} color={t.trim} anchorX="center">
        Memory Palace
      </Text>
      <Text position={[0, 2.48, 3.35]} fontSize={0.09} color="#6B5344" anchorX="center" maxWidth={5}>
        Walk ahead. Each door is one topic.
      </Text>

      <HardwoodFloor width={CORRIDOR_OPENING + 0.2} depth={6} y={0.012} />
      <group position={[0, 0, -2.8]}>
        <OrnateRug width={CORRIDOR_OPENING} depth={4} primary="#6B3A45" secondary="#C4B48A" border="#8A7355" />
      </group>
    </group>
  );
}

function QuietPlaque({
  position,
  rotation,
  title,
  line,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  title: string;
  line: string;
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[1.15, 0.72, 0.04]} />
        <meshStandardMaterial color={t.trim} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0, 0.025]}>
        <planeGeometry args={[1.02, 0.58]} />
        <meshStandardMaterial color="#F6F1E8" roughness={0.92} />
      </mesh>
      <Text position={[0, 0.1, 0.04]} fontSize={0.07} color="#3F3A34" anchorX="center" anchorY="middle">
        {title}
      </Text>
      <Text position={[0, -0.1, 0.04]} fontSize={0.045} maxWidth={0.9} color="#6B5E52" anchorX="center" anchorY="middle" textAlign="center">
        {line}
      </Text>
    </group>
  );
}
