import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.163.0/build/three.module.js';
import { terrainHeightAt } from './utils.js';

function roadSegment(width, length, color = 0x898f92) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width, length),
    new THREE.MeshStandardMaterial({ color, roughness: 1, metalness: 0 })
  );
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

export function createRoadNetwork() {
  const group = new THREE.Group();

  const defs = [
    { x: -60, z: 0, w: 16, l: 370, r: 0 },
    { x: 60, z: -40, w: 14, l: 290, r: Math.PI / 12 },
    { x: 190, z: -90, w: 12, l: 360, r: Math.PI / 2.8 },
    { x: -180, z: 12, w: 11, l: 290, r: Math.PI / 2 },
    { x: -270, z: 40, w: 10, l: 240, r: Math.PI / 2.4 },
    { x: 340, z: 20, w: 12, l: 280, r: Math.PI / 2 },
  ];

  defs.forEach((d) => {
    const s = roadSegment(d.w, d.l, 0x8a8f92);
    s.position.set(d.x, terrainHeightAt(d.x, d.z) + 0.14, d.z);
    s.rotation.y = d.r;
    group.add(s);
  });

  // wheel tracks in tundra
  const trackMat = new THREE.MeshStandardMaterial({ color: 0x747b7f, roughness: 1 });
  for (let i = 0; i < 22; i++) {
    const z = -340 + i * 45;
    const x = 430 + Math.sin(i * 0.7) * 28;
    const track = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 24), trackMat);
    track.rotation.x = -Math.PI / 2;
    track.position.set(x, terrainHeightAt(x, z) + 0.08, z);
    track.rotation.y = Math.sin(i * 1.2) * 0.35;
    group.add(track);
  }

  return group;
}
