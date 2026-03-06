import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.163.0/build/three.module.js';
import { createTerrain } from './terrain.js';
import { setupEnvironment, createFloodLight } from './environment.js';
import { createRoadNetwork } from './roads.js';
import { createCampAndHQ } from './buildings.js';
import { createConstructionZone } from './construction.js';
import { createAnimals } from './animals.js';
import { createBox, terrainHeightAt } from './utils.js';

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
