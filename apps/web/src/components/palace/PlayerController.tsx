import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  CORRIDOR_WIDTH,
  HALL_LENGTH,
  HALL_WIDTH,
  MOVE_SPEED,
  PLAYER_EYE,
  ROOM_DEPTH,
  ROOM_WIDTH,
  corridorEndZ,
} from "../../lib/palaceLayout";
import { usePalaceNav } from "./palaceNav";

const keys = new Set<string>();
const LOOK_SENS = 0.003;
const PITCH_LIMIT = 1.15;

const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();
const _move = new THREE.Vector3();
const _yAxis = new THREE.Vector3(0, 1, 0);

export default function PlayerController({ roomCount }: { roomCount: number }) {
  const { camera, gl } = useThree();
  const nav = usePalaceNav();
  const dragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const zoneRef = useRef(nav.zone);
  const roomOriginRef = useRef(nav.roomOrigin);

  zoneRef.current = nav.zone;
  roomOriginRef.current = nav.roomOrigin;

  useEffect(() => {
    camera.position.copy(nav.playerPosRef.current);
    camera.rotation.order = "YXZ";
    camera.rotation.y = nav.yawRef.current;
    camera.rotation.x = 0;
  }, [camera, nav.syncTick]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => keys.add(e.code);
    const up = (e: KeyboardEvent) => keys.delete(e.code);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useEffect(() => {
    const canvas = gl.domElement;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      dragging.current = true;
      lastPointer.current = { x: e.clientX, y: e.clientY };
      canvas.setPointerCapture(e.pointerId);
    };

    const onPointerUp = (e: PointerEvent) => {
      dragging.current = false;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;
      lastPointer.current = { x: e.clientX, y: e.clientY };

      camera.rotation.y -= dx * LOOK_SENS;
      camera.rotation.x -= dy * LOOK_SENS;
      camera.rotation.x = THREE.MathUtils.clamp(camera.rotation.x, -PITCH_LIMIT, PITCH_LIMIT);
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("pointermove", onPointerMove);

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("pointermove", onPointerMove);
    };
  }, [gl, camera]);

  useFrame((_, delta) => {
    const turn = delta * 2.4;
    if (keys.has("ArrowLeft")) camera.rotation.y += turn;
    if (keys.has("ArrowRight")) camera.rotation.y -= turn;

    const yaw = camera.rotation.y;
    _forward.set(0, 0, -1).applyAxisAngle(_yAxis, yaw);
    _right.set(1, 0, 0).applyAxisAngle(_yAxis, yaw);
    _move.set(0, 0, 0);

    if (keys.has("KeyW") || keys.has("ArrowUp")) _move.add(_forward);
    if (keys.has("KeyS") || keys.has("ArrowDown")) _move.sub(_forward);
    if (keys.has("KeyA")) _move.sub(_right);
    if (keys.has("KeyD")) _move.add(_right);

    if (_move.lengthSq() > 0) {
      _move.normalize().multiplyScalar(MOVE_SPEED * delta);
      camera.position.add(_move);
    }

    camera.position.y = PLAYER_EYE;

    const zone = zoneRef.current;
    if (zone === "hall" && camera.position.z < 0.5) {
      nav.teleport([0, PLAYER_EYE, -2], camera.rotation.y, "corridor", null);
    }

    clampPosition(camera.position, zone, roomCount, roomOriginRef.current);
    nav.playerPosRef.current.copy(camera.position);
    nav.yawRef.current = camera.rotation.y;
  });

  return null;
}

function clampPosition(
  pos: THREE.Vector3,
  zone: string,
  roomCount: number,
  roomOrigin: { x: number; z: number } | null,
) {
  const endZ = corridorEndZ(roomCount);
  if (zone === "hall") {
    pos.x = THREE.MathUtils.clamp(pos.x, -HALL_WIDTH / 2 + 0.5, HALL_WIDTH / 2 - 0.5);
    pos.z = THREE.MathUtils.clamp(pos.z, -2, HALL_LENGTH / 2 - 0.5);
    return;
  }
  if (zone === "corridor") {
    pos.x = THREE.MathUtils.clamp(pos.x, -CORRIDOR_WIDTH / 2 + 0.35, CORRIDOR_WIDTH / 2 - 0.35);
    pos.z = THREE.MathUtils.clamp(pos.z, endZ, 2);
    return;
  }
  if (zone === "room" && roomOrigin) {
    pos.x = THREE.MathUtils.clamp(
      pos.x,
      roomOrigin.x - ROOM_WIDTH / 2 + 0.4,
      roomOrigin.x + ROOM_WIDTH / 2 - 0.4,
    );
    pos.z = THREE.MathUtils.clamp(
      pos.z,
      roomOrigin.z - ROOM_DEPTH / 2 + 0.4,
      roomOrigin.z + ROOM_DEPTH / 2 - 0.4,
    );
  }
}
