import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from "react";
import * as THREE from "three";

export type PalaceZone = "hall" | "corridor" | "room";

interface NearDoor {
  conceptId: string;
  title: string;
}

interface PalaceNavState {
  zone: PalaceZone;
  roomId: string | null;
  roomOrigin: { x: number; z: number } | null;
  /** Updated every frame in refs — read in useFrame, not for React render. */
  playerPosRef: MutableRefObject<THREE.Vector3>;
  yawRef: MutableRefObject<number>;
  /** Bumps on teleport / enter / exit so camera can sync once. */
  syncTick: number;
  nearDoor: NearDoor | null;
  nearPortrait: NearDoor | null;
  setPlayerTransform: (pos: THREE.Vector3, yaw: number) => void;
  setNearDoor: (door: NearDoor | null) => void;
  setNearPortrait: (p: NearDoor | null) => void;
  enterRoom: (
    conceptId: string,
    spawn: [number, number, number],
    faceYaw: number,
    origin: [number, number, number],
  ) => void;
  exitRoom: (corridorPos: [number, number, number], yaw: number) => void;
  teleport: (pos: [number, number, number], yaw: number, zone: PalaceZone, roomId: string | null) => void;
}

const PalaceNavContext = createContext<PalaceNavState | null>(null);

export function PalaceNavProvider({ children }: { children: ReactNode }) {
  const [zone, setZone] = useState<PalaceZone>("hall");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomOrigin, setRoomOrigin] = useState<{ x: number; z: number } | null>(null);
  const [syncTick, setSyncTick] = useState(0);
  const [nearDoor, setNearDoor] = useState<NearDoor | null>(null);
  const [nearPortrait, setNearPortrait] = useState<NearDoor | null>(null);

  const playerPosRef = useRef(new THREE.Vector3(0, 1.65, 5));
  const yawRef = useRef(0);

  const bumpSync = () => setSyncTick((t) => t + 1);

  const value = useMemo<PalaceNavState>(
    () => ({
      zone,
      roomId,
      roomOrigin,
      playerPosRef,
      yawRef,
      syncTick,
      nearDoor,
      nearPortrait,
      setPlayerTransform: (pos, y) => {
        playerPosRef.current.copy(pos);
        yawRef.current = y;
      },
      setNearDoor,
      setNearPortrait,
      enterRoom: (conceptId, spawn, faceYaw, origin) => {
        setZone("room");
        setRoomId(conceptId);
        setRoomOrigin({ x: origin[0], z: origin[2] });
        playerPosRef.current.set(spawn[0], spawn[1], spawn[2]);
        yawRef.current = faceYaw;
        setNearDoor(null);
        bumpSync();
      },
      exitRoom: (corridorPos, faceYaw) => {
        setZone("corridor");
        setRoomId(null);
        setRoomOrigin(null);
        playerPosRef.current.set(corridorPos[0], corridorPos[1], corridorPos[2]);
        yawRef.current = faceYaw;
        setNearPortrait(null);
        bumpSync();
      },
      teleport: (pos, faceYaw, z, rid) => {
        setZone(z);
        setRoomId(rid);
        setRoomOrigin(null);
        playerPosRef.current.set(pos[0], pos[1], pos[2]);
        yawRef.current = faceYaw;
        bumpSync();
      },
    }),
    [zone, roomId, roomOrigin, syncTick, nearDoor, nearPortrait],
  );

  return <PalaceNavContext.Provider value={value}>{children}</PalaceNavContext.Provider>;
}

export function usePalaceNav() {
  const ctx = useContext(PalaceNavContext);
  if (!ctx) throw new Error("usePalaceNav outside provider");
  return ctx;
}

/** Avoid re-renders when proximity target unchanged. */
export function setNearDoorIfChanged(
  current: NearDoor | null,
  next: NearDoor | null,
  setter: (d: NearDoor | null) => void,
) {
  const curId = current?.conceptId ?? null;
  const nextId = next?.conceptId ?? null;
  if (curId === nextId) return;
  setter(next);
}

export function setNearPortraitIfChanged(
  current: NearDoor | null,
  next: NearDoor | null,
  setter: (d: NearDoor | null) => void,
) {
  const curId = current?.conceptId ?? null;
  const nextId = next?.conceptId ?? null;
  if (curId === nextId) return;
  setter(next);
}
