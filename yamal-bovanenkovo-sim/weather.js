import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.163.0/build/three.module.js';

export function createWeather(scene) {
  const flakesCount = 2400;
  const positions = new Float32Array(flakesCount * 3);
  const velocities = new Float32Array(flakesCount);

  for (let i = 0; i < flakesCount; i++) {
    const ix = i * 3;
    positions[ix] = (Math.random() - 0.5) * 1200;
    positions[ix + 1] = Math.random() * 180 + 8;
    positions[ix + 2] = (Math.random() - 0.5) * 1200;
    velocities[i] = 4 + Math.random() * 5;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({
    color: 0xf4f8ff,
    size: 0.7,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.75,
    depthWrite: false,
  });

  const points = new THREE.Points(geo, mat);
  scene.add(points);

  let mode = 'light';

  return {
    toggle() {
      mode = mode === 'light' ? 'dense' : 'light';
      mat.opacity = mode === 'light' ? 0.75 : 0.9;
      mat.size = mode === 'light' ? 0.7 : 0.95;
      scene.fog.near = mode === 'light' ? 200 : 140;
      scene.fog.far = mode === 'light' ? 980 : 680;
    },
    update(dt, playerPos) {
      const p = geo.attributes.position;
      const wind = mode === 'light' ? 2.2 : 4.2;
      for (let i = 0; i < flakesCount; i++) {
        const ix = i * 3;
        p.array[ix] += wind * dt;
        p.array[ix + 1] -= velocities[i] * dt;
        p.array[ix + 2] += Math.sin((i + performance.now() * 0.002) * 0.01) * 0.01;

        if (p.array[ix + 1] < 1) {
          p.array[ix + 1] = 140 + Math.random() * 80;
          p.array[ix] = playerPos.x + (Math.random() - 0.5) * 900;
          p.array[ix + 2] = playerPos.z + (Math.random() - 0.5) * 900;
        }

        if (p.array[ix] > playerPos.x + 620) p.array[ix] -= 1240;
      }
      p.needsUpdate = true;
    },
  };
}
