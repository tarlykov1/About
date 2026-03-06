import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.163.0/build/three.module.js';
import { PointerLockControls } from 'https://cdn.jsdelivr.net/npm/three@0.163.0/examples/jsm/controls/PointerLockControls.js';
import { clamp, terrainHeightAt } from './utils.js';

export function createPlayerControls(camera, domElement) {
  const controls = new PointerLockControls(camera, domElement);

  const velocity = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const keys = {
    KeyW: false,
    KeyS: false,
    KeyA: false,
    KeyD: false,
    ShiftLeft: false,
    Space: false,
  };

  let verticalVelocity = 0;
  let canJump = false;
  const eyeHeight = 1.7;

  const onKey = (v) => (e) => {
    if (keys[e.code] !== undefined) {
      keys[e.code] = v;
      if (e.code === 'Space') e.preventDefault();
    }
  };

  document.addEventListener('keydown', onKey(true));
  document.addEventListener('keyup', onKey(false));

  return {
    controls,
    lock: () => controls.lock(),
    update(dt) {
      const speed = keys.ShiftLeft ? 21 : 11.5;
      const friction = 8.5;

      direction.set(0, 0, Number(keys.KeyS) - Number(keys.KeyW));
      direction.x = Number(keys.KeyD) - Number(keys.KeyA);
      direction.normalize();

      velocity.x -= velocity.x * friction * dt;
      velocity.z -= velocity.z * friction * dt;

      if (keys.KeyW || keys.KeyS) velocity.z += direction.z * speed * dt * 14;
      if (keys.KeyA || keys.KeyD) velocity.x += direction.x * speed * dt * 14;

      controls.moveRight(velocity.x * dt);
      controls.moveForward(velocity.z * dt);

      const pos = camera.position;
      const ground = terrainHeightAt(pos.x, pos.z) + eyeHeight;

      verticalVelocity -= 18 * dt;
      if (keys.Space && canJump) {
        verticalVelocity = 7.2;
        canJump = false;
      }

      pos.y += verticalVelocity * dt;
      if (pos.y <= ground) {
        pos.y = ground;
        verticalVelocity = 0;
        canJump = true;
      }

      pos.y = clamp(pos.y, ground, ground + 14);
    },
  };
}
