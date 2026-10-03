import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";
import type { ConceptState } from "../types";

interface Props {
  concept: ConceptState;
  selected: boolean;
  onSelect: () => void;
}

export default function MemoryObject({ concept, selected, onSelect }: Props) {
  const group = useRef<THREE.Group>(null);
  const [hover, setHover] = useState(false);
  const glow = selected || concept.forgetProbability > 0.55;
  const scale = hover || selected ? 1.12 : 1;

  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.position.y =
      concept.position[1] + Math.sin(clock.elapsedTime * 1.2 + concept.pathIndex) * 0.04;
    group.current.rotation.y += 0.004;
  });

  return (
    <group
      ref={group}
      position={concept.position}
      scale={scale}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHover(false);
        document.body.style.cursor = "default";
      }}
    >
      <PropMesh shape={concept.prop.shape} color={concept.prop.color} glow={glow} />
      {(hover || selected || glow) && (
        <pointLight
          intensity={glow ? 2.2 : 1}
          distance={4}
          color={concept.prop.color}
          position={[0, 0.4, 0]}
        />
      )}
      <Html
        center
        distanceFactor={8}
        style={{
          pointerEvents: "none",
          userSelect: "none",
          whiteSpace: "nowrap",
        }}
      >
        <div
          className={`rounded-full px-2 py-0.5 text-xs font-medium backdrop-blur-md ${
            glow ? "bg-amber-glow/20 text-amber-glow" : "bg-black/50 text-slate-200"
          }`}
        >
          {concept.title}
        </div>
      </Html>
    </group>
  );
}

function PropMesh({
  shape,
  color,
  glow,
}: {
  shape: string;
  color: string;
  glow: boolean;
}) {
  const mat = (
    <meshStandardMaterial
      color={color}
      emissive={color}
      emissiveIntensity={glow ? 0.45 : 0.12}
      metalness={0.35}
      roughness={0.4}
    />
  );

  switch (shape) {
    case "torus":
      return (
        <mesh>
          <torusGeometry args={[0.35, 0.12, 16, 32]} />
          {mat}
        </mesh>
      );
    case "pyramid":
      return (
        <mesh rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[0.45, 0.7, 4]} />
          {mat}
        </mesh>
      );
    case "octahedron":
      return (
        <mesh>
          <octahedronGeometry args={[0.42, 0]} />
          {mat}
        </mesh>
      );
    case "cluster":
      return (
        <group>
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
        <mesh>
          <icosahedronGeometry args={[0.4, 1]} />
          {mat}
        </mesh>
      );
    case "flame":
      return (
        <mesh>
          <coneGeometry args={[0.28, 0.75, 8]} />
          {mat}
        </mesh>
      );
    case "gem":
      return (
        <mesh rotation={[0, 0.6, 0]}>
          <dodecahedronGeometry args={[0.38, 0]} />
          {mat}
        </mesh>
      );
    default:
      return (
        <mesh>
          <boxGeometry args={[0.55, 0.55, 0.55]} />
          {mat}
        </mesh>
      );
  }
}
