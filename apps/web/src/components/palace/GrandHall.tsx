import { Text } from "@react-three/drei";
import { HALL_LENGTH, HALL_WIDTH, ROOM_HEIGHT } from "../../lib/palaceLayout";
import { accentAt, hallWallColor } from "./colorUtils";
import {
  Baseboard,
  CeilingMedallion,
  Chandelier,
  ClassicalColumn,
  ColorfulPainting,
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
        <OrnateRug
          width={4.5}
          depth={5.8}
          primary="#9D174D"
          secondary="#F472B6"
          border={t.brass}
        />
      </group>

      <PaintedWall
        width={0.18}
        height={h}
        depth={l}
        position={[-w / 2, h / 2, l / 4]}
        color={hallWallColor("left")}
      />
      <PaintedWall
        width={0.18}
        height={h}
        depth={l}
        position={[w / 2, h / 2, l / 4]}
        color={hallWallColor("right")}
      />
      <Wainscoting width={0.2} height={wainscotH} depth={l} position={[-w / 2 + 0.02, wainscotH / 2, l / 4]} />
      <Wainscoting width={0.2} height={wainscotH} depth={l} position={[w / 2 - 0.02, wainscotH / 2, l / 4]} />
      <ChairRail width={0.22} depth={l} position={[-w / 2 + 0.03, wainscotH + 0.03, l / 4]} color={accentAt(0)} />
      <ChairRail width={0.22} depth={l} position={[w / 2 - 0.03, wainscotH + 0.03, l / 4]} color={accentAt(2)} />

      {[-2.5, 0.5, 3.2].map((z, i) => (
        <ColorfulPainting
          key={`L${z}`}
          position={[-w / 2 + 0.14, 1.85, z]}
          rotation={[0, Math.PI / 2, 0]}
          colors={[accentAt(i), accentAt(i + 3), accentAt(i + 6)]}
        />
      ))}
      {[-1.8, 1.2, 3.8].map((z, i) => (
        <ColorfulPainting
          key={`R${z}`}
          position={[w / 2 - 0.14, 1.85, z]}
          rotation={[0, -Math.PI / 2, 0]}
          colors={[accentAt(i + 1), accentAt(i + 4), accentAt(i + 7)]}
        />
      ))}

      <PaintedWall
        width={sidePanelW}
        height={h}
        depth={0.18}
        position={[-(CORRIDOR_OPENING / 2 + sidePanelW / 2), h / 2, backZ]}
        color="#FEF3C7"
      />
      <PaintedWall
        width={sidePanelW}
        height={h}
        depth={0.18}
        position={[CORRIDOR_OPENING / 2 + sidePanelW / 2, h / 2, backZ]}
        color="#FEF3C7"
      />
      <mesh position={[0, h * 0.72, backZ + 0.06]}>
        <boxGeometry args={[CORRIDOR_OPENING + 0.35, 0.22, 0.14]} />
        <meshStandardMaterial color={accentAt(5)} roughness={0.55} metalness={0.08} />
      </mesh>

      <mesh position={[0, h - 0.08, l / 4]}>
        <boxGeometry args={[w - 0.4, 0.12, l - 0.5]} />
        <meshStandardMaterial color={t.ceiling} roughness={0.92} />
      </mesh>
      <CrownMolding width={w - 0.5} depth={l - 0.5} position={[0, h - 0.22, l / 4]} color={t.trimHighlight} />
      <CeilingMedallion position={[0, h - 0.14, 1.5]} color={t.brass} />
      <Baseboard width={w - 0.3} position={[0, 0.06, l / 4 - l / 2 + 0.2]} />
      <Baseboard width={w - 0.3} position={[0, 0.06, l / 4 + l / 2 - 0.2]} />

      <ClassicalColumn position={[-3.2, 0, 0.5]} capitalColor={accentAt(1)} />
      <ClassicalColumn position={[3.2, 0, 0.5]} capitalColor={accentAt(4)} />
      <Chandelier position={[0, h - 0.35, 1.5]} gemColor={accentAt(3)} />
      <ConsoleTable position={[0, 0, 3.2]} />
      <PottedPlant position={[-4.2, 0, 2.2]} potColor={accentAt(6)} />
      <PottedPlant position={[4.2, 0, 2.2]} potColor={accentAt(8)} />
      <FloorLamp position={[-2.2, 0, 4]} shade={accentAt(7)} />
      <FloorLamp position={[2.2, 0, 4]} shade={accentAt(9)} />

      <Text position={[0, 2.75, 3.35]} fontSize={0.22} color={t.trim} anchorX="center">
        Memory Palace
      </Text>
      <Text position={[0, 2.48, 3.35]} fontSize={0.09} color="#6B5344" anchorX="center" maxWidth={5}>
        A colourful manor of study rooms — walk ahead into the hall
      </Text>

      <HardwoodFloor width={CORRIDOR_OPENING + 0.2} depth={6} y={0.012} />
      <group position={[0, 0, -2.8]}>
        <OrnateRug width={CORRIDOR_OPENING} depth={4} primary="#7C3AED" secondary="#C4B5FD" border="#FBBF24" />
      </group>
    </group>
  );
}
