import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import MemoryObject from "./MemoryObject";
import type { ConceptState } from "../types";

interface Props {
  concepts: ConceptState[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function PalaceScene({ concepts, selectedId, onSelect }: Props) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 2.8, 7.5], fov: 45 }}
      className="h-full w-full touch-none"
    >
      <color attach="background" args={["#0B1020"]} />
      <fog attach="fog" args={["#0B1020", 8, 22]} />
      <ambientLight intensity={0.35} />
      <directionalLight castShadow position={[4, 8, 2]} intensity={1.1} />
      <Environment preset="night" />

      <Room />

      {concepts.map((c) => (
        <MemoryObject
          key={c.id}
          concept={c}
          selected={c.id === selectedId}
          onSelect={() => onSelect(c.id)}
        />
      ))}

      <ContactShadows position={[0, 0.01, 0]} opacity={0.45} scale={12} blur={2.5} far={6} />
      <OrbitControls
        enablePan={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={5}
        maxDistance={11}
        target={[0, 1, 0]}
      />
    </Canvas>
  );
}

function Room() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#121829" metalness={0.2} roughness={0.85} />
      </mesh>
      <mesh position={[0, 2.5, -5]} receiveShadow>
        <planeGeometry args={[14, 5]} />
        <meshStandardMaterial color="#1a2238" />
      </mesh>
      <mesh position={[-5, 2.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[14, 5]} />
        <meshStandardMaterial color="#151c30" />
      </mesh>
      <mesh position={[5, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[14, 5]} />
        <meshStandardMaterial color="#151c30" />
      </mesh>
      {/* Path markers */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[-3.5 + i, 0.02, 2.5 - i * 0.35]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.08, 0.12, 24]} />
          <meshBasicMaterial color="#F59E0B" transparent opacity={0.35} />
        </mesh>
      ))}
    </group>
  );
}
