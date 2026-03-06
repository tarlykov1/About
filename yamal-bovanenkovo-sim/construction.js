import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.163.0/build/three.module.js';
import { createBox, terrainHeightAt } from './utils.js';
import { createFloodLight } from './environment.js';

function bulldozer(x, z) {
  const g = new THREE.Group();
  const y = terrainHeightAt(x, z);
  g.position.set(x, y, z);

  const body = createBox(new THREE.Vector3(7, 2.2, 4), 0xc79c3e, 0.45, 0.55);
  body.position.y = 2;
  g.add(body);

  const cab = createBox(new THREE.Vector3(2.6, 2.2, 2.4), 0x4e5964, 0.45, 0.45);
  cab.position.set(1.2, 3.3, 0);
  g.add(cab);

  const blade = createBox(new THREE.Vector3(0.7, 2.2, 5.3), 0x6d767f, 0.6, 0.4);
  blade.position.set(-3.5, 1.7, 0);
  g.add(blade);

  for (const s of [-1.4, 1.4]) {
    const track = createBox(new THREE.Vector3(6.5, 1, 0.8), 0x23282f, 0.2, 0.9);
    track.position.set(0, 0.7, s);
    g.add(track);
  }

  return g;
}

function dumpTruck(x, z) {
  const g = new THREE.Group();
  const y = terrainHeightAt(x, z);
  g.position.set(x, y, z);

  const base = createBox(new THREE.Vector3(9, 1.6, 3.6), 0x46515a, 0.35, 0.7);
  base.position.y = 1.4;
  g.add(base);

  const cabin = createBox(new THREE.Vector3(2.4, 2.2, 3.1), 0xcb9239, 0.45, 0.5);
  cabin.position.set(2.9, 2.6, 0);
  g.add(cabin);

  const bed = createBox(new THREE.Vector3(4.8, 2, 3.2), 0x848f95, 0.5, 0.5);
  bed.position.set(-1.6, 2.4, 0);
  g.add(bed);

  const wheelGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.7, 16);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1f252a, roughness: 0.9 });
  for (const wx of [-3.2, -0.8, 2.2]) {
    for (const wz of [-1.8, 1.8]) {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(wx, 0.85, wz);
      g.add(w);
    }
  }

  return g;
}

function crawlerCrane(x, z) {
  const g = new THREE.Group();
  const y = terrainHeightAt(x, z);
  g.position.set(x, y, z);

  g.add(createBox(new THREE.Vector3(8, 1.2, 4), 0x394248, 0.35, 0.65).translateY(1.4));
  const house = createBox(new THREE.Vector3(3.8, 2.8, 3), 0xb88e35, 0.45, 0.55);
  house.position.y = 3.3;
  g.add(house);

  const boom = createBox(new THREE.Vector3(0.8, 0.8, 22), 0x6e7880, 0.55, 0.45);
  boom.position.set(0, 6.2, -9.5);
  boom.rotation.x = -0.24;
  g.add(boom);

  const hook = createBox(new THREE.Vector3(0.35, 3.2, 0.35), 0x25292e, 0.4, 0.7);
  hook.position.set(0, 4.4, -18.2);
  g.add(hook);

  return g;
}

function pipeLayer(x, z) {
  const g = bulldozer(x, z);
  const arm = createBox(new THREE.Vector3(0.5, 3.6, 6), 0x6e757b, 0.5, 0.5);
  arm.position.set(1.5, 4.1, 0);
  g.add(arm);
  const clamp = new THREE.Mesh(
    new THREE.TorusGeometry(1.2, 0.25, 10, 16, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0x687278, metalness: 0.6, roughness: 0.5 })
  );
  clamp.position.set(1.5, 5.8, 0);
  clamp.rotation.z = Math.PI / 2;
  g.add(clamp);
  return g;
}

function allTerrainVehicle(x, z, color = 0x5f7264) {
  const y = terrainHeightAt(x, z);
  const g = new THREE.Group();
  g.position.set(x, y, z);

  const body = createBox(new THREE.Vector3(4.6, 1.6, 2.8), color, 0.25, 0.8);
  body.position.y = 1.35;
  g.add(body);

  const roof = createBox(new THREE.Vector3(2.4, 1.1, 2.4), 0x4d5861, 0.3, 0.6);
  roof.position.set(0.5, 2.6, 0);
  g.add(roof);

  const skiGeo = new THREE.BoxGeometry(1.8, 0.22, 0.3);
  const skiMat = new THREE.MeshStandardMaterial({ color: 0x20262b, roughness: 0.85 });
  for (const sx of [-1.3, 1.3]) {
    const ski = new THREE.Mesh(skiGeo, skiMat);
    ski.position.set(sx, 0.2, 0.7);
    g.add(ski);
  }

  return g;
}

export function createConstructionZone() {
  const group = new THREE.Group();

  group.add(bulldozer(-8, 46));
  group.add(bulldozer(36, -24));
  group.add(dumpTruck(44, 38));
  group.add(dumpTruck(66, 12));
  group.add(crawlerCrane(14, -64));
  group.add(pipeLayer(126, -48));
  group.add(allTerrainVehicle(-38, -22));
  group.add(allTerrainVehicle(-72, 66, 0x6a7b6a));

  // Temporary structures and signs
  for (let i = 0; i < 14; i++) {
    const x = -18 + (i % 7) * 14;
    const z = -6 + Math.floor(i / 7) * 32;
    const y = terrainHeightAt(x, z);
    const pallet = createBox(new THREE.Vector3(6, 0.5, 4), 0x8c9296, 0.2, 0.8);
    pallet.position.set(x, y + 0.25, z);
    group.add(pallet);
  }

  for (const [x, z] of [
    [-56, -66],
    [6, -110],
    [80, -100],
    [124, -24],
    [-120, 18],
  ]) {
    group.add(createFloodLight(x, z));
  }

  return group;
}
