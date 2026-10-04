import type { SemanticId } from "../../lib/topicKnowledge";

const ink = "#3F3A34";
const paper = "#E7E1D6";
const leaf = "#5E7A62";
const wood = "#6B4E32";
const teal = "#3E6B66";
const clay = "#8C5E4A";
const sand = "#C4B48A";

function Mat({ color, glow }: { color: string; glow?: boolean }) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={0.72}
      metalness={0.04}
      emissive={glow ? color : "#000"}
      emissiveIntensity={glow ? 0.18 : 0}
    />
  );
}

export default function MemorySculpture({
  kind,
  glow,
}: {
  kind: SemanticId;
  glow?: boolean;
}) {
  switch (kind) {
    case "decisionTree":
      return <DecisionTree glow={glow} />;
    case "randomForest":
      return <RandomForest glow={glow} />;
    case "hierarchicalClustering":
      return <Hierarchy glow={glow} />;
    case "kmeans":
    case "clustering":
      return <ClusterPiles glow={glow} labeled={kind === "kmeans"} />;
    case "gradientDescent":
    case "optimization":
      return <Descent glow={glow} />;
    case "neuralNetwork":
      return <Network glow={glow} />;
    case "svm":
    case "classification":
      return <Margin glow={glow} />;
    case "crossValidation":
      return <Folds glow={glow} />;
    case "regularization":
      return <Fence glow={glow} />;
    case "linearRegression":
    case "regression":
      return <FitLine glow={glow} wavy={false} />;
    case "overfitting":
      return <FitLine glow={glow} wavy />;
    case "underfitting":
      return <StiffRuler glow={glow} />;
    case "knn":
      return <Neighbors glow={glow} />;
    case "pca":
      return <Projection glow={glow} />;
    case "graph":
      return <Network glow={glow} compact />;
    case "probability":
      return <Bell glow={glow} />;
    case "database":
      return <Disks glow={glow} />;
    case "sorting":
      return <OrderedBlocks glow={glow} />;
    case "recursion":
      return <Nested glow={glow} />;
    default:
      return <PedestalMark glow={glow} />;
  }
}

function DecisionTree({ glow }: { glow?: boolean }) {
  return (
    <group>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.06, 0.09, 0.44, 8]} />
        <Mat color={wood} glow={glow} />
      </mesh>
      <Branch from={[0, 0.42, 0]} to={[-0.28, 0.72, 0.05]} />
      <Branch from={[0, 0.42, 0]} to={[0.28, 0.72, -0.04]} />
      <Branch from={[-0.28, 0.72, 0.05]} to={[-0.42, 0.98, 0.08]} />
      <Branch from={[-0.28, 0.72, 0.05]} to={[-0.12, 0.98, 0]} />
      <Node at={[0, 0.42, 0]} />
      <Node at={[-0.28, 0.72, 0.05]} />
      <Node at={[0.28, 0.72, -0.04]} />
      <Leaf at={[-0.42, 1.02, 0.08]} />
      <Leaf at={[-0.12, 1.02, 0]} />
      <Leaf at={[0.28, 0.78, -0.04]} />
    </group>
  );
}

function RandomForest({ glow }: { glow?: boolean }) {
  return (
    <group>
      {[-0.32, 0, 0.32].map((x, i) => (
        <group key={x} position={[x, 0, i === 1 ? 0.08 : -0.05]} scale={i === 1 ? 0.85 : 0.62}>
          <DecisionTree glow={glow} />
        </group>
      ))}
    </group>
  );
}

function Hierarchy({ glow }: { glow?: boolean }) {
  const nodes: [number, number][] = [
    [0, 1.05],
    [-0.28, 0.72],
    [0.28, 0.72],
    [-0.42, 0.38],
    [-0.14, 0.38],
    [0.14, 0.38],
    [0.42, 0.38],
  ];
  const edges: [number, number][] = [
    [0, 1],
    [0, 2],
    [1, 3],
    [1, 4],
    [2, 5],
    [2, 6],
  ];
  return (
    <group>
      {edges.map(([a, b]) => (
        <Branch key={`${a}-${b}`} from={[nodes[a]![0], nodes[a]![1], 0]} to={[nodes[b]![0], nodes[b]![1], 0]} />
      ))}
      {nodes.map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0]}>
          <sphereGeometry args={[i === 0 ? 0.09 : 0.06, 12, 12]} />
          <Mat color={i < 3 ? teal : sand} glow={glow} />
        </mesh>
      ))}
    </group>
  );
}

function ClusterPiles({ glow, labeled }: { glow?: boolean; labeled?: boolean }) {
  const piles = [
    { c: "#6E8AA0", pts: [[-0.35, 0.2, 0.05], [-0.22, 0.28, -0.08], [-0.4, 0.32, -0.02]] },
    { c: "#8C5E4A", pts: [[0.05, 0.22, 0.12], [0.16, 0.3, 0], [0.02, 0.34, -0.06]] },
    { c: "#5E7A62", pts: [[0.32, 0.2, -0.02], [0.42, 0.3, 0.08], [0.28, 0.34, 0.1]] },
  ];
  return (
    <group>
      {piles.map((pile) =>
        pile.pts.map((p, i) => (
          <mesh key={`${pile.c}-${i}`} position={p as [number, number, number]}>
            <sphereGeometry args={[0.07, 10, 10]} />
            <Mat color={pile.c} glow={glow} />
          </mesh>
        )),
      )}
      {labeled &&
        [[-0.32, 0.12, 0], [0.08, 0.12, 0.04], [0.34, 0.12, 0]].map((p, i) => (
          <mesh key={i} position={p as [number, number, number]}>
            <sphereGeometry args={[0.045, 10, 10]} />
            <Mat color={ink} glow={glow} />
          </mesh>
        ))}
    </group>
  );
}

function Descent({ glow }: { glow?: boolean }) {
  return (
    <group>
      <mesh position={[0, 0.28, 0]} rotation={[0, 0, -0.55]}>
        <boxGeometry args={[1.15, 0.06, 0.42]} />
        <Mat color={sand} glow={glow} />
      </mesh>
      <mesh position={[0.28, 0.58, 0]}>
        <sphereGeometry args={[0.1, 14, 14]} />
        <Mat color={clay} glow={glow} />
      </mesh>
      <mesh position={[-0.38, 0.18, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.04, 12]} />
        <Mat color={teal} glow={glow} />
      </mesh>
    </group>
  );
}

function Network({ glow, compact }: { glow?: boolean; compact?: boolean }) {
  const layers = compact
    ? [[-0.2, 0.45], [0.2, 0.45]]
    : [
        [-0.38, 0.35],
        [-0.38, 0.62],
        [0, 0.28],
        [0, 0.55],
        [0, 0.82],
        [0.38, 0.4],
        [0.38, 0.68],
      ];
  const layerOf = (i: number) => (compact ? (i < 1 ? 0 : 1) : i < 2 ? 0 : i < 5 ? 1 : 2);
  return (
    <group>
      {layers.map((a, i) =>
        layers.map((b, j) =>
          layerOf(j) === layerOf(i) + 1 ? (
            <Branch key={`${i}-${j}`} from={[a[0], a[1], 0]} to={[b[0], b[1], 0]} thin />
          ) : null,
        ),
      )}
      {layers.map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <Mat color={i % 2 ? teal : ink} glow={glow} />
        </mesh>
      ))}
    </group>
  );
}

function Margin({ glow }: { glow?: boolean }) {
  return (
    <group>
      {[[-0.35, 0.35], [-0.22, 0.55], [-0.4, 0.62]].map((p, i) => (
        <mesh key={`a${i}`} position={[p[0], p[1], 0]}>
          <sphereGeometry args={[0.06, 10, 10]} />
          <Mat color={teal} glow={glow} />
        </mesh>
      ))}
      {[[0.28, 0.32], [0.4, 0.5], [0.22, 0.64]].map((p, i) => (
        <mesh key={`b${i}`} position={[p[0], p[1], 0]}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <Mat color={clay} glow={glow} />
        </mesh>
      ))}
      <mesh position={[0, 0.5, 0]} rotation={[0, 0, 0.15]}>
        <boxGeometry args={[0.03, 0.85, 0.02]} />
        <Mat color={ink} glow={glow} />
      </mesh>
    </group>
  );
}

function Folds({ glow }: { glow?: boolean }) {
  return (
    <group>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[-0.36 + i * 0.24, 0.28, 0]}>
          <boxGeometry args={[0.18, 0.28, 0.12]} />
          <Mat color={i === 2 ? clay : paper} glow={glow} />
        </mesh>
      ))}
    </group>
  );
}

function Fence({ glow }: { glow?: boolean }) {
  return (
    <group>
      <mesh position={[0, 0.32, 0]}>
        <sphereGeometry args={[0.16, 12, 12]} />
        <Mat color={sand} glow={glow} />
      </mesh>
      {[-0.28, 0.28].map((x) => (
        <mesh key={x} position={[x, 0.28, 0]}>
          <boxGeometry args={[0.04, 0.42, 0.04]} />
          <Mat color={wood} glow={glow} />
        </mesh>
      ))}
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[0.6, 0.03, 0.03]} />
        <Mat color={wood} glow={glow} />
      </mesh>
    </group>
  );
}

function FitLine({ glow, wavy }: { glow?: boolean; wavy?: boolean }) {
  const pts = wavy
    ? [-0.4, -0.2, 0, 0.18, 0.38]
    : [-0.35, -0.1, 0.15, 0.35];
  return (
    <group>
      {pts.map((x, i) => (
        <mesh key={i} position={[x, 0.25 + (wavy ? Math.sin(i) * 0.12 : 0.05), 0]}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <Mat color={ink} />
        </mesh>
      ))}
      <mesh position={[0, wavy ? 0.4 : 0.36, 0]} rotation={[0, 0, wavy ? 0.4 : -0.35]}>
        <boxGeometry args={[wavy ? 0.15 : 0.9, 0.03, 0.03]} />
        <Mat color={teal} glow={glow} />
      </mesh>
      {wavy &&
        [-0.15, 0.1].map((x) => (
          <mesh key={x} position={[x, 0.48, 0]} rotation={[0, 0, x]}>
            <boxGeometry args={[0.28, 0.025, 0.025]} />
            <Mat color={clay} glow={glow} />
          </mesh>
        ))}
    </group>
  );
}

function StiffRuler({ glow }: { glow?: boolean }) {
  return (
    <group>
      {[-0.3, -0.05, 0.2, 0.35].map((x, i) => (
        <mesh key={x} position={[x, 0.22 + (i % 2) * 0.16, 0]}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <Mat color={ink} />
        </mesh>
      ))}
      <mesh position={[0, 0.32, 0]} rotation={[0, 0, -0.05]}>
        <boxGeometry args={[0.95, 0.035, 0.035]} />
        <Mat color={clay} glow={glow} />
      </mesh>
    </group>
  );
}

function Neighbors({ glow }: { glow?: boolean }) {
  return (
    <group>
      <mesh position={[0, 0.45, 0]}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <Mat color={clay} glow={glow} />
      </mesh>
      <mesh position={[0, 0.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.22, 0.012, 8, 20]} />
        <Mat color={teal} glow={glow} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2;
        const near = i < 3;
        const r = near ? 0.2 : 0.38;
        return (
          <mesh key={i} position={[Math.cos(a) * r, 0.45, Math.sin(a) * r * 0.35]}>
            <sphereGeometry args={[0.045, 8, 8]} />
            <Mat color={near ? teal : sand} />
          </mesh>
        );
      })}
    </group>
  );
}

function Projection({ glow }: { glow?: boolean }) {
  return (
    <group>
      <mesh position={[0, 0.22, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.9, 0.45]} />
        <Mat color={paper} glow={glow} />
      </mesh>
      {[[-0.2, 0.55, 0.1], [0.05, 0.7, -0.05], [0.2, 0.48, 0.08]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <Mat color={teal} />
        </mesh>
      ))}
      <mesh position={[0, 0.24, 0]} rotation={[0, 0, 0.2]}>
        <boxGeometry args={[0.7, 0.02, 0.02]} />
        <Mat color={ink} glow={glow} />
      </mesh>
    </group>
  );
}

function Bell({ glow }: { glow?: boolean }) {
  return (
    <group>
      {[-0.32, -0.16, 0, 0.16, 0.32].map((x, i) => (
        <mesh key={x} position={[x, 0.16 + [0.12, 0.28, 0.42, 0.28, 0.12][i]!, 0]}>
          <boxGeometry args={[0.1, 0.08 + i * 0.02, 0.08]} />
          <Mat color={i === 2 ? teal : sand} glow={glow && i === 2} />
        </mesh>
      ))}
    </group>
  );
}

function Disks({ glow }: { glow?: boolean }) {
  return (
    <group>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 0.16 + i * 0.16, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.08, 16]} />
          <Mat color={i === 1 ? teal : ink} glow={glow} />
        </mesh>
      ))}
    </group>
  );
}

function OrderedBlocks({ glow }: { glow?: boolean }) {
  return (
    <group>
      {[0.18, 0.32, 0.48, 0.66].map((h, i) => (
        <mesh key={h} position={[-0.3 + i * 0.2, h / 2, 0]}>
          <boxGeometry args={[0.14, h, 0.14]} />
          <Mat color={i % 2 ? teal : wood} glow={glow} />
        </mesh>
      ))}
    </group>
  );
}

function Nested({ glow }: { glow?: boolean }) {
  return (
    <group>
      {[0.42, 0.28, 0.14].map((s, i) => (
        <mesh key={s} position={[0, 0.24 + i * 0.02, 0]}>
          <boxGeometry args={[s, s, 0.06]} />
          <meshStandardMaterial color={i === 2 ? teal : paper} wireframe={i < 2} roughness={0.7} />
        </mesh>
      ))}
      {glow && (
        <mesh position={[0, 0.28, 0]}>
          <boxGeometry args={[0.08, 0.08, 0.08]} />
          <Mat color={clay} glow />
        </mesh>
      )}
    </group>
  );
}

function PedestalMark({ glow }: { glow?: boolean }) {
  return (
    <mesh position={[0, 0.28, 0]}>
      <octahedronGeometry args={[0.22, 0]} />
      <Mat color={teal} glow={glow} />
    </mesh>
  );
}

function Node({ at }: { at: [number, number, number] }) {
  return (
    <mesh position={at}>
      <sphereGeometry args={[0.055, 10, 10]} />
      <Mat color={ink} />
    </mesh>
  );
}

function Leaf({ at }: { at: [number, number, number] }) {
  return (
    <mesh position={at}>
      <sphereGeometry args={[0.07, 10, 10]} />
      <Mat color={leaf} />
    </mesh>
  );
}

function Branch({
  from,
  to,
  thin,
}: {
  from: [number, number, number];
  to: [number, number, number];
  thin?: boolean;
}) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const dz = to[2] - from[2];
  const len = Math.hypot(dx, dy, dz) || 0.01;
  const mid: [number, number, number] = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2];
  const rot = Math.atan2(dx, dy);
  return (
    <mesh position={mid} rotation={[0, 0, -rot]}>
      <cylinderGeometry args={[thin ? 0.012 : 0.02, thin ? 0.012 : 0.025, len, 6]} />
      <Mat color={thin ? "#8A8175" : wood} />
    </mesh>
  );
}
