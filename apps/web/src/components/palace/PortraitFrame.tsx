import { Text } from "@react-three/drei";
import { useMemo } from "react";
import { createPortraitTexture } from "../../lib/portraitArt";
import { palaceTheme as t } from "./palaceTheme";

export default function PortraitFrame({
  conceptId,
  title,
  accent,
  highlight,
  interactive,
  onClick,
}: {
  conceptId: string;
  title: string;
  accent: string;
  highlight: boolean;
  interactive?: boolean;
  onClick?: () => void;
}) {
  const texture = useMemo(
    () => createPortraitTexture(conceptId, title, accent),
    [conceptId, title, accent],
  );

  return (
    <group position={[0, 1.55, 0]}>
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[2.55, 1.62, 0.1]} />
        <meshStandardMaterial color={t.trim} roughness={0.55} metalness={0.06} />
      </mesh>
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[2.35, 1.42, 0.06]} />
        <meshStandardMaterial color={t.brass} roughness={0.4} metalness={0.45} />
      </mesh>
      <mesh
        position={[0, 0, 0.03]}
        onClick={(e) => {
          e.stopPropagation();
          if (interactive) onClick?.();
        }}
        onPointerOver={() => {
          if (interactive) document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "default";
        }}
      >
        <planeGeometry args={[2.05, 1.28]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      {highlight && (
        <pointLight position={[0, 0, 0.45]} intensity={0.45} color={accent} distance={2.5} />
      )}
      <Text
        position={[0, -0.78, 0.05]}
        maxWidth={2}
        fontSize={0.08}
        color={t.trim}
        anchorX="center"
        anchorY="middle"
        textAlign="center"
      >
        {interactive ? "Click portrait for notes" : title}
      </Text>
    </group>
  );
}
