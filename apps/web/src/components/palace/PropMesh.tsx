import type { ConceptState } from "../../types";

export default function PropMesh({
  shape,
  color,
  glow,
  scale = 1,
}: {
  shape: string;
  color: string;
  glow: boolean;
  scale?: number;
}) {
  const mat = (
    <meshStandardMaterial
      color={color}
      emissive={color}
      emissiveIntensity={glow ? 0.35 : 0.12}
      metalness={0.35}
      roughness={0.4}
    />
  );

  const s = scale;

  switch (shape) {
    case "torus":
      return (
        <mesh scale={s}>
          <torusGeometry args={[0.35, 0.12, 16, 32]} />
          {mat}
        </mesh>
      );
    case "pyramid":
      return (
        <mesh rotation={[0, Math.PI / 4, 0]} scale={s}>
          <coneGeometry args={[0.45, 0.7, 4]} />
          {mat}
        </mesh>
      );
    case "octahedron":
      return (
        <mesh scale={s}>
          <octahedronGeometry args={[0.42, 0]} />
          {mat}
        </mesh>
      );
    case "cluster":
      return (
        <group scale={s}>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[Math.sin(i) * 0.2, i * 0.15, Math.cos(i) * 0.2]}>
              <sphereGeometry args={[0.18, 16, 16]} />
              {mat}
            </mesh>
          ))}
        </group>
      );
    case "vine":
      return (
        <mesh scale={s}>
          <icosahedronGeometry args={[0.4, 1]} />
          {mat}
        </mesh>
      );
    case "flame":
      return (
        <mesh scale={s}>
          <coneGeometry args={[0.28, 0.75, 8]} />
          {mat}
        </mesh>
      );
    case "gem":
      return (
        <mesh rotation={[0, 0.6, 0]} scale={s}>
          <dodecahedronGeometry args={[0.38, 0]} />
          {mat}
        </mesh>
      );
    default:
      return (
        <mesh scale={s}>
          <boxGeometry args={[0.55, 0.55, 0.55]} />
          {mat}
        </mesh>
      );
  }
}

export function conceptGlow(concept: ConceptState, selected: boolean) {
  return selected || concept.forgetProbability > 0.55;
}
