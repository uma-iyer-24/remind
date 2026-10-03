import { Text } from "@react-three/drei";
import { useState } from "react";
import type { WallTidbit } from "../../lib/wallTidbits";

type Shape = "plaque" | "scroll" | "gem";

export default function WallTidbitObject({
  tidbit,
  position,
  rotation = [0, 0, 0],
  accent,
  shape,
  interactive,
  onSelect,
}: {
  tidbit: WallTidbit;
  position: [number, number, number];
  rotation?: [number, number, number];
  accent: string;
  shape: Shape;
  interactive: boolean;
  onSelect: (t: WallTidbit) => void;
}) {
  const [hover, setHover] = useState(false);

  return (
    <group position={position} rotation={rotation}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          if (interactive) onSelect(tidbit);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (interactive) {
            setHover(true);
            document.body.style.cursor = "pointer";
          }
        }}
        onPointerOut={() => {
          setHover(false);
          document.body.style.cursor = "default";
        }}
      >
        {shape === "plaque" && <boxGeometry args={[0.55, 0.42, 0.06]} />}
        {shape === "scroll" && <boxGeometry args={[0.35, 0.55, 0.05]} />}
        {shape === "gem" && <octahedronGeometry args={[0.22, 0]} />}
        <meshStandardMaterial
          color={hover ? accent : "#FDE68A"}
          emissive={accent}
          emissiveIntensity={hover ? 0.55 : interactive ? 0.25 : 0.1}
          roughness={0.45}
        />
      </mesh>
      <Text
        position={[0, shape === "scroll" ? -0.38 : -0.32, 0.05]}
        fontSize={0.07}
        color="#1E1B4B"
        anchorX="center"
        anchorY="middle"
      >
        {tidbit.label}
      </Text>
    </group>
  );
}
