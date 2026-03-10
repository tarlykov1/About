import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.163.0/build/three.module.js';
import { createTerrain } from './terrain.js';
import { setupEnvironment, createFloodLight } from './environment.js';
import { createRoadNetwork } from './roads.js';
import { createCampAndHQ } from './buildings.js';
import { createConstructionZone } from './construction.js';
import { createAnimals } from './animals.js';
import { createBox, terrainHeightAt } from './utils.js';

function createIndustrialTower(x, z, h = 34) {
  const g = new THREE.Group();
  const y = terrainHeightAt(x, z);
  g.position.set(x, y, z);

  const geom = new THREE.CylinderGeometry(0.3, 0.55, h, 10);
  for (let i = 0; i < 6; i++) {
    const seg = new THREE.Mesh(
      geom,
      new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0xd1d7de : 0xc84f56,
        metalness: 0.55,
        roughness: 0.42,
      })
    );
    seg.position.y = h / 2;
    seg.scale.y = 1 / 6;
    seg.position.y = (i + 0.5) * (h / 6);
    g.add(seg);
  }

  const antenna = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.1, 3, 8),
    new THREE.MeshStandardMaterial({ color: 0x9ca5ad, metalness: 0.6, roughness: 0.35 })
  );
  antenna.position.y = h + 1.5;
  g.add(antenna);

  return g;
}

function createPipeRack(x, z, len, rot = 0) {
  const g = new THREE.Group();
  g.position.set(x, terrainHeightAt(x, z), z);
  g.rotation.y = rot;

  const steel = new THREE.MeshStandardMaterial({ color: 0x8f9ba5, metalness: 0.65, roughness: 0.4 });
  const pipeMat = new THREE.MeshStandardMaterial({ color: 0xb9c7d2, metalness: 0.7, roughness: 0.35 });

  const deck = new THREE.Mesh(new THREE.BoxGeometry(len, 0.35, 2.8), steel);
  deck.position.y = 3;
  g.add(deck);

  for (let i = -Math.floor(len / 12); i <= Math.floor(len / 12); i++) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.45, 3, 0.45), steel);
    p.position.set(i * 6, 1.5, -1.1);
    const p2 = p.clone();
    p2.position.z = 1.1;
    g.add(p, p2);
  }

  for (const pz of [-0.85, 0, 0.85]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, len, 10), pipeMat);
    p.rotation.z = Math.PI / 2;
    p.position.set(0, 3.45, pz);
    g.add(p);
  }
  return g;
}

function createProcessingPlantCluster() {
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xc7d1d9, roughness: 0.72, metalness: 0.22 });
  const blueMat = new THREE.MeshStandardMaterial({ color: 0x2280c3, roughness: 0.62, metalness: 0.32 });
  const stackMat = new THREE.MeshStandardMaterial({ color: 0x8d9398, roughness: 0.58, metalness: 0.4 });

  const units = [
    [250, 130],
    [320, 120],
    [390, 90],
    [280, 40],
    [355, 25],
    [430, 10],
  ];

  units.forEach(([x, z], idx) => {
    const y = terrainHeightAt(x, z);
    const shell = new THREE.Mesh(new THREE.BoxGeometry(38, 15, 22), bodyMat);
    shell.position.set(x, y + 7.5, z);
    group.add(shell);

    const blueHead = new THREE.Mesh(new THREE.BoxGeometry(12, 7.5, 12), blueMat);
    blueHead.position.set(x + 9, y + 14, z - 4);
    group.add(blueHead);

    const stack = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 3.1, 24, 14), stackMat);
    stack.position.set(x - 9, y + 12, z + 5);
    group.add(stack);

    if (idx % 2 === 0) {
      group.add(createIndustrialTower(x + 18, z + 20, 36));
    }
  });

  const rackLines = [
    [310, 105, 250, 0],
    [340, 62, 280, 0],
    [368, 25, 260, 0],
    [272, 80, 190, Math.PI / 2.5],
    [420, 70, 170, Math.PI / 1.95],
  ];
  rackLines.forEach(([x, z, len, rot]) => group.add(createPipeRack(x, z, len, rot)));

  for (let i = 0; i < 8; i++) {
    group.add(createIndustrialTower(230 + i * 36, -10 + (i % 2) * 22, 28 + (i % 3) * 6));
  }

  return group;
}

function createSnowStorageRows() {
  const g = new THREE.Group();
  const padMat = new THREE.MeshStandardMaterial({ color: 0xd9e2e8, roughness: 0.95 });
  const edgeMat = new THREE.MeshStandardMaterial({ color: 0xb2bdc6, roughness: 0.9 });

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 2; c++) {
      const x = 40 + c * 54;
      const z = 250 + r * 22;
      const y = terrainHeightAt(x, z);
      const pad = new THREE.Mesh(new THREE.BoxGeometry(42, 1.1, 8), padMat);
      pad.position.set(x, y + 0.55, z);
      const edge = new THREE.Mesh(new THREE.BoxGeometry(42, 0.25, 0.8), edgeMat);
      edge.position.set(x, y + 0.95, z + 3.6);
      const edge2 = edge.clone();
      edge2.position.z = z - 3.6;
      g.add(pad, edge, edge2);
    }
  }
  return g;
}

function createPipelineYard() {
  const group = new THREE.Group();

  const rackMat = new THREE.MeshStandardMaterial({ color: 0x687278, metalness: 0.55, roughness: 0.55 });
  const pipeMat = new THREE.MeshStandardMaterial({ color: 0x4c555d, metalness: 0.7, roughness: 0.35 });

  for (let row = 0; row < 6; row++) {
    for (let i = 0; i < 15; i++) {
      const x = 130 + i * 13;
      const z = -200 + row * 30;
      const y = terrainHeightAt(x, z);

      const supports = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 8), rackMat);
      supports.position.set(x, y + 0.65, z);
      group.add(supports);

      for (let l = 0; l < 3; l++) {
        const pipe = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 11.5, 16), pipeMat);
        pipe.rotation.z = Math.PI / 2;
        pipe.position.set(x, y + 2 + l * 1.35, z);
        group.add(pipe);
      }
    }
  }

  // pipeline route section
  for (let i = 0; i < 18; i++) {
    const x = 200 + i * 18;
    const z = -260 + Math.sin(i * 0.35) * 20;
    const y = terrainHeightAt(x, z);
    const seg = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 16, 18), pipeMat);
    seg.rotation.z = Math.PI / 2;
    seg.position.set(x, y + 3.3, z);
    group.add(seg);

    const stand = createBox(new THREE.Vector3(1, 3, 2), 0x6a747a, 0.5, 0.5);
    stand.position.set(x, y + 1.5, z);
    group.add(stand);
  }

  return group;
}

function createPeripheralProps() {
  const group = new THREE.Group();

  for (let i = 0; i < 60; i++) {
    const x = -420 + Math.random() * 840;
    const z = -420 + Math.random() * 840;
    if (Math.hypot(x, z) < 180) continue;
    const y = terrainHeightAt(x, z);

    const h = 0.8 + Math.random() * 2.5;
    const mound = new THREE.Mesh(
      new THREE.ConeGeometry(2.2 + Math.random() * 2.5, h, 8),
      new THREE.MeshStandardMaterial({ color: 0xd8e1e9, roughness: 0.9 })
    );
    mound.position.set(x, y + h / 2, z);
    group.add(mound);
  }

  for (const [x, z] of [
    [-340, -240],
    [420, 280],
    [510, -150],
    [-520, 190],
    [600, 40],
    [-620, -80],
  ]) {
    group.add(createFloodLight(x, z));
  }

  return group;
}

export function buildWorld(scene, renderer) {
  const systems = {};

  systems.environment = setupEnvironment(scene, renderer);
  scene.add(createTerrain());
  scene.add(createRoadNetwork());
  scene.add(createCampAndHQ());
  scene.add(createConstructionZone());
  scene.add(createPipelineYard());
  scene.add(createProcessingPlantCluster());
  scene.add(createSnowStorageRows());
  scene.add(createPeripheralProps());

  // containers and signs around main area
  const markers = new THREE.Group();
  for (let i = 0; i < 22; i++) {
    const x = -40 + (i % 11) * 17;
    const z = 84 + Math.floor(i / 11) * 9;
    const y = terrainHeightAt(x, z);
    const c = createBox(new THREE.Vector3(8, 2.8, 2.8), i % 2 ? 0x6d7b86 : 0x5d6b76, 0.35, 0.75);
    c.position.set(x, y + 1.4, z);
    markers.add(c);
  }
  scene.add(markers);

  const sign = createBox(new THREE.Vector3(5.5, 2, 0.2), 0x73808b, 0.3, 0.7);
  sign.position.set(-86, terrainHeightAt(-86, 110) + 2.8, 110);
  scene.add(sign);

  systems.animals = createAnimals();
  scene.add(systems.animals.group);

  return systems;
}
