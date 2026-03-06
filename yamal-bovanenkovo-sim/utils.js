import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.163.0/build/three.module.js';

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export function seededRandom(seed = 1) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function noise2D(x, z) {
  const a = Math.sin(x * 0.0037 + z * 0.0049) * 0.5;
  const b = Math.cos(x * 0.0091 - z * 0.0043) * 0.35;
  const c = Math.sin((x + z) * 0.013) * 0.15;
  return a + b + c;
}

export function terrainHeightAt(x, z) {
  const base = noise2D(x, z) * 8;
  const drift = Math.sin(z * 0.001) * 2 + Math.cos(x * 0.0012) * 1.8;
  return base + drift;
}

export function createBox(size, color, metalness = 0.25, roughness = 0.75) {
  const mat = new THREE.MeshStandardMaterial({ color, metalness, roughness });
  const geo = new THREE.BoxGeometry(size.x, size.y, size.z);
  return new THREE.Mesh(geo, mat);
}

export function worldZoneLabel(pos) {
  const d = Math.hypot(pos.x, pos.z);
  if (d < 120) return { zone: 'Construction Site', status: 'СТРОЙПЛОЩАДКА' };
  if (pos.x > -320 && pos.x < -40 && pos.z > -130 && pos.z < 160)
    return { zone: 'Modular Camp', status: 'МОДУЛЬНЫЙ ГОРОДОК' };
  if (pos.x > 90 && pos.x < 360 && pos.z > -270 && pos.z < 120)
    return { zone: 'Pipeline Yard', status: 'СКЛАД ТРУБ' };
  if (d < 520) return { zone: 'Peripheral Works', status: 'ПЕРИФЕРИЯ' };
  return { zone: 'Arctic Tundra', status: 'ТУНДРА' };
}
