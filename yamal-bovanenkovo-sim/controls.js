import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.163.0/build/three.module.js';
import { clamp, terrainHeightAt } from './utils.js';

export function createPlayerControls(camera, domElement) {
  const velocity = new THREE.Vector3();
  const move = new THREE.Vector3();
  const forward = new THREE.Vector3();
  const right = new THREE.Vector3();

  const keys = {
    KeyW: false,
    KeyS: false,
    KeyA: false,
    KeyD: false,
    ShiftLeft: false,
    Space: false,
  };

  const look = { yaw: 0, pitch: 0 };
  const state = { started: false, pointerLocked: false };

  let verticalVelocity = 0;
  let canJump = false;
  const eyeHeight = 1.7;
  const sensitivity = 0.0022;

  function applyCameraRotation() {
    camera.rotation.order = 'YXZ';
    camera.rotation.y = look.yaw;
    camera.rotation.x = look.pitch;
  }

  function onMouseMove(e) {
    if (!state.started) return;
    look.yaw -= e.movementX * sensitivity;
    look.pitch -= e.movementY * sensitivity;
    look.pitch = clamp(look.pitch, -Math.PI * 0.49, Math.PI * 0.49);
    applyCameraRotation();
  }

  function onPointerLockChange() {
    state.pointerLocked = document.pointerLockElement === domElement;
  }

  const onKey = (v) => (e) => {
    if (keys[e.code] !== undefined) {
      keys[e.code] = v;
      if (e.code === 'Space') e.preventDefault();
    }
  };

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('pointerlockchange', onPointerLockChange);
  document.addEventListener('keydown', onKey(true));
  document.addEventListener('keyup', onKey(false));

  applyCameraRotation();

  return {
    get isLocked() {
      return state.started;
    },
    lock() {
      state.started = true;
      if (document.pointerLockElement !== domElement && domElement.requestPointerLock) {
        const lockResult = domElement.requestPointerLock();
        if (lockResult && typeof lockResult.catch === 'function') {
          lockResult.catch(() => {});
        }
      }
      if (domElement.focus) domElement.focus();
    },
    update(dt) {
      const speed = keys.ShiftLeft ? 21 : 11.5;
      const friction = 8.5;

      move.set(Number(keys.KeyD) - Number(keys.KeyA), 0, Number(keys.KeyS) - Number(keys.KeyW));
      if (move.lengthSq() > 0) move.normalize();

      velocity.x -= velocity.x * friction * dt;
      velocity.z -= velocity.z * friction * dt;

      if (keys.KeyW || keys.KeyS) velocity.z += move.z * speed * dt * 14;
      if (keys.KeyA || keys.KeyD) velocity.x += move.x * speed * dt * 14;

      forward.set(0, 0, -1).applyQuaternion(camera.quaternion);
      forward.y = 0;
      forward.normalize();

      right.crossVectors(forward, camera.up).normalize();

      camera.position.addScaledVector(forward, -velocity.z * dt);
      camera.position.addScaledVector(right, velocity.x * dt);

      const ground = terrainHeightAt(camera.position.x, camera.position.z) + eyeHeight;

      verticalVelocity -= 18 * dt;
      if (keys.Space && canJump) {
        verticalVelocity = 7.2;
        canJump = false;
      }

      camera.position.y += verticalVelocity * dt;
      if (camera.position.y <= ground) {
        camera.position.y = ground;
        verticalVelocity = 0;
        canJump = true;
      }

      camera.position.y = clamp(camera.position.y, ground, ground + 14);
    },
  };
}
