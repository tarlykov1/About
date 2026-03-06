import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.163.0/build/three.module.js';
import { createBox, terrainHeightAt } from './utils.js';

function modularBuilding({ x, z, len = 24, w = 7, h = 4, color = 0xcfd8de, roof = 0x5f7281 }) {
  const g = new THREE.Group();
  const y = terrainHeightAt(x, z);
  g.position.set(x, y, z);

  const body = createBox(new THREE.Vector3(len, h, w), color, 0.15, 0.85);
  body.position.y = h / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);

  const roofMesh = createBox(new THREE.Vector3(len + 0.4, 0.6, w + 0.6), roof, 0.3, 0.6);
  roofMesh.position.y = h + 0.3;
  roofMesh.castShadow = true;
  g.add(roofMesh);

  const winMat = new THREE.MeshStandardMaterial({ color: 0x8ca2b2, emissive: 0x516070, emissiveIntensity: 0.2 });
  const winGeo = new THREE.BoxGeometry(1.4, 1.1, 0.15);
  for (let i = -Math.floor(len / 5); i <= Math.floor(len / 5); i++) {
    if (Math.abs(i) < 1) continue;
    const winL = new THREE.Mesh(winGeo, winMat);
    winL.position.set(i * 2.2, h * 0.55, w / 2 + 0.08);
    const winR = winL.clone();
    winR.position.z = -w / 2 - 0.08;
    g.add(winL, winR);
  }

  const stairs = createBox(new THREE.Vector3(2.6, 0.6, 1.8), 0x707c86, 0.4, 0.55);
  stairs.position.set(-len / 2 + 2, 0.3, w / 2 + 1.2);
  g.add(stairs);

  return g;
}

function container(x, z, color = 0x7b8b97) {
  const y = terrainHeightAt(x, z);
  const c = createBox(new THREE.Vector3(6, 2.7, 2.6), color, 0.35, 0.7);
  c.position.set(x, y + 1.35, z);
  c.castShadow = true;
  c.receiveShadow = true;
  return c;
}

export function createCampAndHQ() {
  const group = new THREE.Group();

  // HQ + admin block
  group.add(modularBuilding({ x: -120, z: -40, len: 40, w: 10, h: 5, color: 0xd5dde3, roof: 0x607483 }));
  group.add(modularBuilding({ x: -148, z: -65, len: 24, w: 8, h: 4, color: 0xcbd5dd, roof: 0x5d6f7c }));

  // camp rows
  for (let r = 0; r < 3; r++) {
    for (let i = 0; i < 4; i++) {
      group.add(
        modularBuilding({
          x: -250 + i * 34,
          z: -90 + r * 58,
          len: 26,
          w: 7,
          h: 3.8,
          color: 0xd2d9df,
          roof: r % 2 ? 0x556b79 : 0x4f6674,
        })
      );
    }
  }

  // canteen + checkpoint
  group.add(modularBuilding({ x: -178, z: 122, len: 30, w: 9, h: 4.3, color: 0xd0d9de, roof: 0x687a85 }));
  group.add(modularBuilding({ x: -72, z: 145, len: 18, w: 8, h: 3.6, color: 0xc8d0d7, roof: 0x667884 }));

  // generator blocks + containers
  for (let i = 0; i < 20; i++) {
    const x = -295 + (i % 5) * 9;
    const z = 118 + Math.floor(i / 5) * 5;
    group.add(container(x, z, i % 2 ? 0x768692 : 0x6c7d89));
  }

  // fence perimeter around camp
  const fenceMat = new THREE.MeshStandardMaterial({ color: 0x5c666e, metalness: 0.5, roughness: 0.5 });
  const postGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.2, 8);
  const railGeo = new THREE.BoxGeometry(6, 0.12, 0.12);
  for (let i = 0; i < 48; i++) {
    const angle = (i / 48) * Math.PI * 2;
    const x = -185 + Math.cos(angle) * 145;
    const z = 10 + Math.sin(angle) * 145;
    const y = terrainHeightAt(x, z);

    const post = new THREE.Mesh(postGeo, fenceMat);
    post.position.set(x, y + 1.1, z);
    group.add(post);

    if (i % 2 === 0) {
      const rail = new THREE.Mesh(railGeo, fenceMat);
      rail.position.set(x, y + 1.35, z);
      rail.rotation.y = angle + Math.PI / 2;
      group.add(rail);
    }
  }

  return group;
}
