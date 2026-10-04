import { accentAt, palaceTheme as t } from "./palaceTheme";

const wood = { roughness: 0.72, metalness: 0.04 };
const paint = { roughness: 0.88, metalness: 0 };

export function HardwoodFloor({
  width,
  depth,
  y = 0.01,
}: {
  width: number;
  depth: number;
  y?: number;
}) {
  const boards = Math.min(12, Math.ceil(width / 0.45));
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color={t.floorWoodDark} {...wood} />
      </mesh>
      {Array.from({ length: boards }).map((_, i) => {
        const x = -width / 2 + (i + 0.5) * (width / boards);
        return (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, y + 0.004, 0]}>
            <planeGeometry args={[width / boards - 0.03, depth]} />
            <meshStandardMaterial color={i % 2 === 0 ? t.floorWood : t.floorWoodDark} {...wood} />
          </mesh>
        );
      })}
    </group>
  );
}

export function OrnateRug({
  width,
  depth,
  primary,
  secondary,
  border = t.brass,
  y = 0.018,
}: {
  width: number;
  depth: number;
  primary: string;
  secondary: string;
  border?: string;
  y?: number;
}) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color={border} roughness={0.92} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y + 0.002, 0]}>
        <planeGeometry args={[width * 0.88, depth * 0.9]} />
        <meshStandardMaterial color={primary} roughness={0.94} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y + 0.004, 0]}>
        <planeGeometry args={[width * 0.55, depth * 0.52]} />
        <meshStandardMaterial color={secondary} roughness={0.93} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y + 0.005, 0]}>
        <planeGeometry args={[width * 0.2, depth * 0.18]} />
        <meshStandardMaterial color={border} roughness={0.9} emissive={border} emissiveIntensity={0.08} />
      </mesh>
    </group>
  );
}

export function AreaRug({
  width,
  depth,
  color = t.runner,
  y = 0.018,
}: {
  width: number;
  depth: number;
  color?: string;
  y?: number;
}) {
  return (
    <OrnateRug width={width} depth={depth} primary={color} secondary={t.trimHighlight} border={t.brass} y={y} />
  );
}

export function PaintedWall({
  width,
  height,
  depth,
  position,
  color = t.wall,
}: {
  width: number;
  height: number;
  depth: number;
  position: [number, number, number];
  color?: string;
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color={color} {...paint} />
    </mesh>
  );
}

export function ChairRail({
  width,
  depth,
  position,
  color,
}: {
  width: number;
  depth: number;
  position: [number, number, number];
  color: string;
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={[width, 0.06, depth]} />
      <meshStandardMaterial color={color} roughness={0.75} metalness={0.12} />
    </mesh>
  );
}

export function Wainscoting({
  width,
  height,
  depth,
  position,
  color = t.wainscot,
}: {
  width: number;
  height: number;
  depth: number;
  position: [number, number, number];
  color?: string;
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color={color} roughness={0.82} />
    </mesh>
  );
}

export function Baseboard({
  width,
  position,
  color = t.trim,
}: {
  width: number;
  position: [number, number, number];
  color?: string;
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={[width, 0.12, 0.06]} />
      <meshStandardMaterial color={color} {...wood} />
    </mesh>
  );
}

export function CrownMolding({
  width,
  depth,
  position,
  color = t.trim,
}: {
  width: number;
  depth: number;
  position: [number, number, number];
  color?: string;
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={[width, 0.1, depth]} />
      <meshStandardMaterial color={color} {...wood} />
    </mesh>
  );
}

export function CeilingMedallion({ position, color = t.brass }: { position: [number, number, number]; color?: string }) {
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.45, 0.06, 10, 24]} />
        <meshStandardMaterial color={color} metalness={0.35} roughness={0.45} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.28, 20]} />
        <meshStandardMaterial color={t.ceiling} roughness={0.9} />
      </mesh>
    </group>
  );
}

export function Chandelier({
  position,
  gemColor = "#C4B48A",
  quiet = false,
}: {
  position: [number, number, number];
  gemColor?: string;
  quiet?: boolean;
}) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.02, 0.02, 0.35, 8]} />
        <meshStandardMaterial color={t.brass} metalness={0.55} roughness={0.35} />
      </mesh>
      <mesh position={[0, -0.2, 0]}>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshStandardMaterial color="#FFF8E7" emissive="#FFE4A8" emissiveIntensity={0.5} roughness={0.25} />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2;
        const c = quiet ? "#CDB892" : accentAt(i);
        return (
          <mesh key={i} position={[Math.cos(a) * 0.32, -0.32, Math.sin(a) * 0.32]}>
            <sphereGeometry args={[0.055, 8, 8]} />
            <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.25} roughness={0.35} />
          </mesh>
        );
      })}
      <mesh position={[0, -0.38, 0]}>
        <octahedronGeometry args={[0.07, 0]} />
        <meshStandardMaterial color={gemColor} emissive={gemColor} emissiveIntensity={0.35} metalness={0.2} />
      </mesh>
    </group>
  );
}

export function WallSconce({
  position,
  rotation = [0, 0, 0],
  shadeColor = "#FFD88A",
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  shadeColor?: string;
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[0.1, 0.24, 0.14]} />
        <meshStandardMaterial color={t.brass} metalness={0.6} roughness={0.32} />
      </mesh>
      <mesh position={[0, 0, 0.09]}>
        <sphereGeometry args={[0.07, 10, 10]} />
        <meshStandardMaterial color={shadeColor} emissive={shadeColor} emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}

export function ColorfulPainting({
  position,
  rotation = [0, 0, 0],
  colors,
  scale = 1,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  colors: [string, string, string];
  scale?: number;
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh>
        <boxGeometry args={[0.62, 0.48, 0.04]} />
        <meshStandardMaterial color={t.trim} {...wood} />
      </mesh>
      <mesh position={[0, 0.08, 0.025]}>
        <planeGeometry args={[0.48, 0.12]} />
        <meshStandardMaterial color={colors[0]} roughness={0.75} />
      </mesh>
      <mesh position={[0, -0.04, 0.025]}>
        <planeGeometry args={[0.48, 0.12]} />
        <meshStandardMaterial color={colors[1]} roughness={0.75} />
      </mesh>
      <mesh position={[0, -0.16, 0.025]}>
        <planeGeometry args={[0.48, 0.12]} />
        <meshStandardMaterial color={colors[2]} roughness={0.75} />
      </mesh>
    </group>
  );
}

export function PictureFrameEmpty({
  position,
  rotation = [0, 0, 0],
  scale = 1,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}) {
  return (
    <ColorfulPainting
      position={position}
      rotation={rotation}
      scale={scale}
      colors={["#E2E8F0", "#CBD5E1", "#94A3B8"]}
    />
  );
}

export function Bookshelf({
  position,
  rotation = [0, 0, 0],
  height = 2.2,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  height?: number;
}) {
  const w = 0.35;
  const d = 1.1;
  const bookColors = ["#DC2626", "#2563EB", "#059669", "#7C3AED", "#EA580C", "#0891B2", "#BE185D", "#CA8A04"];
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[w, height, d]} />
        <meshStandardMaterial color={t.trim} {...wood} />
      </mesh>
      {[0.35, 0.75, 1.15, 1.55].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <boxGeometry args={[w + 0.02, 0.04, d - 0.05]} />
          <meshStandardMaterial color={t.doorFrame} {...wood} />
        </mesh>
      ))}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh
          key={i}
          position={[0, 0.48 + (i % 4) * 0.38, -d / 2 + 0.12 + Math.floor(i / 4) * 0.32]}
        >
          <boxGeometry args={[0.2, 0.26 + (i % 3) * 0.04, 0.07]} />
          <meshStandardMaterial color={bookColors[i % bookColors.length]!} roughness={0.85} />
        </mesh>
      ))}
      <mesh position={[0, height - 0.08, d / 2 - 0.05]}>
        <boxGeometry args={[0.25, 0.08, 0.12]} />
        <meshStandardMaterial color={t.brass} metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  );
}

export function WindowWithCurtains({
  position,
  rotation = [0, 0, 0],
  curtainColor = "#F472B6",
  paneColors = ["#FDE68A", "#BAE6FD", "#FCA5A5"],
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  curtainColor?: string;
  paneColors?: [string, string, string];
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[0.1, 1.45, 1.05]} />
        <meshStandardMaterial color={t.trim} {...wood} />
      </mesh>
      <mesh position={[0.06, 0.22, 0]}>
        <planeGeometry args={[0.72, 0.38]} />
        <meshStandardMaterial color={paneColors[0]} emissive={paneColors[0]} emissiveIntensity={0.2} roughness={0.3} />
      </mesh>
      <mesh position={[0.06, -0.18, 0]}>
        <planeGeometry args={[0.72, 0.38]} />
        <meshStandardMaterial color={paneColors[1]} emissive={paneColors[1]} emissiveIntensity={0.2} roughness={0.3} />
      </mesh>
      <mesh position={[0.06, 0.02, 0]}>
        <boxGeometry args={[0.03, 1.05, 0.05]} />
        <meshStandardMaterial color={t.trim} {...wood} />
      </mesh>
      <mesh position={[-0.08, 0, 0.42]}>
        <boxGeometry args={[0.12, 1.35, 0.04]} />
        <meshStandardMaterial color={curtainColor} roughness={0.92} />
      </mesh>
      <mesh position={[-0.08, 0, -0.42]}>
        <boxGeometry args={[0.12, 1.35, 0.04]} />
        <meshStandardMaterial color={curtainColor} roughness={0.92} />
      </mesh>
      <mesh position={[-0.1, 0.68, 0]}>
        <boxGeometry args={[0.08, 0.1, 0.95]} />
        <meshStandardMaterial color={t.brass} metalness={0.45} roughness={0.4} />
      </mesh>
    </group>
  );
}

export function FireplaceMantel({ width = 2.2, tileColor = "#B91C1C" }: { width?: number; tileColor?: string }) {
  return (
    <group>
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[width, 0.85, 0.35]} />
        <meshStandardMaterial color={t.trim} roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.12, 0.06]}>
        <boxGeometry args={[width * 0.5, 0.42, 0.05]} />
        <meshStandardMaterial color={tileColor} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.88, 0.02]}>
        <boxGeometry args={[width + 0.18, 0.14, 0.44]} />
        <meshStandardMaterial color={t.trimHighlight} {...wood} />
      </mesh>
      <MantelDecor position={[0, 0.98, 0.12]} />
    </group>
  );
}

export function MantelDecor({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[-0.55, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 0.18, 8]} />
        <meshStandardMaterial color="#FFF" emissive="#FDE68A" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0.55, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 0.18, 8]} />
        <meshStandardMaterial color="#FFF" emissive="#FDE68A" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[0.22, 0.16, 0.08]} />
        <meshStandardMaterial color={t.brass} metalness={0.55} roughness={0.35} />
      </mesh>
      <mesh position={[-0.25, 0.04, 0]}>
        <sphereGeometry args={[0.06, 10, 10]} />
        <meshStandardMaterial color="#EC4899" roughness={0.4} />
      </mesh>
      <mesh position={[0.28, 0.04, 0]}>
        <sphereGeometry args={[0.06, 10, 10]} />
        <meshStandardMaterial color="#38BDF8" roughness={0.4} />
      </mesh>
    </group>
  );
}

export function StudyTable({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.72, 0]}>
        <boxGeometry args={[1.15, 0.07, 0.72]} />
        <meshStandardMaterial color={t.trim} {...wood} />
      </mesh>
      {[
        [-0.42, 0.36, -0.24],
        [0.42, 0.36, -0.24],
        [-0.42, 0.36, 0.24],
        [0.42, 0.36, 0.24],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <cylinderGeometry args={[0.045, 0.05, 0.72, 8]} />
          <meshStandardMaterial color={t.doorFrame} {...wood} />
        </mesh>
      ))}
    </group>
  );
}

export function TableLamp({ position, shade = "#FBBF24" }: { position: [number, number, number]; shade?: string }) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.06, 0.08, 0.04, 10]} />
        <meshStandardMaterial color={t.brass} metalness={0.5} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.22, 8]} />
        <meshStandardMaterial color={t.brass} metalness={0.55} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.28, 0]}>
        <coneGeometry args={[0.1, 0.14, 12, 1, true]} />
        <meshStandardMaterial color={shade} emissive={shade} emissiveIntensity={0.25} roughness={0.6} side={2} />
      </mesh>
    </group>
  );
}

export function Armchair({
  position,
  rotation = [0, 0, 0],
  fabric = "#7C3AED",
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  fabric?: string;
}) {
  const fabricDark = fabric;
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.38, 0]}>
        <boxGeometry args={[0.75, 0.12, 0.7]} />
        <meshStandardMaterial color={fabric} roughness={0.88} />
      </mesh>
      <mesh position={[0, 0.72, -0.28]}>
        <boxGeometry args={[0.75, 0.65, 0.12]} />
        <meshStandardMaterial color={fabricDark} roughness={0.88} />
      </mesh>
      <mesh position={[-0.38, 0.55, 0]}>
        <boxGeometry args={[0.1, 0.45, 0.65]} />
        <meshStandardMaterial color={fabricDark} roughness={0.88} />
      </mesh>
      <mesh position={[0.38, 0.55, 0]}>
        <boxGeometry args={[0.1, 0.45, 0.65]} />
        <meshStandardMaterial color={fabricDark} roughness={0.88} />
      </mesh>
      <mesh position={[0, 0.14, 0.38]}>
        <boxGeometry args={[0.5, 0.08, 0.06]} />
        <meshStandardMaterial color={t.trim} {...wood} />
      </mesh>
    </group>
  );
}

export function FloorLamp({ position, shade = "#FB923C" }: { position: [number, number, number]; shade?: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.12, 0.14, 0.04, 10]} />
        <meshStandardMaterial color={t.trim} {...wood} />
      </mesh>
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 1.45, 8]} />
        <meshStandardMaterial color={t.brass} metalness={0.5} roughness={0.35} />
      </mesh>
      <mesh position={[0, 1.52, 0]}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshStandardMaterial color={shade} emissive={shade} emissiveIntensity={0.3} roughness={0.5} />
      </mesh>
    </group>
  );
}

export function PottedPlant({ position, potColor = "#EA580C" }: { position: [number, number, number]; potColor?: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.14, 0.11, 0.22, 10]} />
        <meshStandardMaterial color={potColor} roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <sphereGeometry args={[0.22, 10, 10]} />
        <meshStandardMaterial color="#15803D" roughness={0.85} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[Math.cos(i * 2) * 0.12, 0.55 + i * 0.05, Math.sin(i * 2) * 0.12]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#22C55E" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

export function ConsoleTable({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[1.4, 0.06, 0.42]} />
        <meshStandardMaterial color={t.trim} {...wood} />
      </mesh>
      <mesh position={[0, 1.35, -0.08]}>
        <boxGeometry args={[0.9, 1.1, 0.04]} />
        <meshStandardMaterial color="#E7E1D6" roughness={0.55} metalness={0.08} />
      </mesh>
      <mesh position={[-0.55, 0.28, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 0.55, 8]} />
        <meshStandardMaterial color={t.brass} metalness={0.65} roughness={0.35} />
      </mesh>
      <mesh position={[0.55, 0.28, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 0.55, 8]} />
        <meshStandardMaterial color={t.brass} metalness={0.65} roughness={0.35} />
      </mesh>
      <VaseWithFlowers position={[0.35, 0.58, 0.05]} />
      <mesh position={[-0.4, 0.6, 0]}>
        <boxGeometry args={[0.12, 0.18, 0.08]} />
        <meshStandardMaterial color="#5C4033" roughness={0.6} />
      </mesh>
    </group>
  );
}

export function VaseWithFlowers({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.07, 0.09, 0.16, 10]} />
        <meshStandardMaterial color="#8A7355" roughness={0.55} />
      </mesh>
      {["#C4B48A", "#8FA396", "#C3A6A0"].map((c, i) => (
        <mesh key={c} position={[Math.cos(i * 2.1) * 0.05, 0.14 + i * 0.03, Math.sin(i * 2.1) * 0.05]}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshStandardMaterial color={c} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

export function ClassicalColumn({ position, capitalColor = t.brass }: { position: [number, number, number]; capitalColor?: string }) {
  const h = 3.8;
  return (
    <group position={position}>
      <mesh position={[0, h / 2, 0]}>
        <cylinderGeometry args={[0.22, 0.26, h, 12]} />
        <meshStandardMaterial color={t.wainscot} roughness={0.75} />
      </mesh>
      <mesh position={[0, h + 0.08, 0]}>
        <boxGeometry args={[0.52, 0.14, 0.52]} />
        <meshStandardMaterial color={capitalColor} roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.1, 12]} />
        <meshStandardMaterial color={t.trim} {...wood} />
      </mesh>
    </group>
  );
}
