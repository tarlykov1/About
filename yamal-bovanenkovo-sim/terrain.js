import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.163.0/build/three.module.js';
import { terrainHeightAt } from './utils.js';

export function createTerrain() {
  const group = new THREE.Group();
  const size = 2200;
  const segments = 220;
  const geo = new THREE.PlaneGeometry(size, size, segments, segments);
  geo.rotateX(-Math.PI / 2);

  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const y = terrainHeightAt(x, z);
    pos.setY(i, y);
  }
  geo.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({
    color: 0xdbe3ea,
    roughness: 0.95,
    metalness: 0.02,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  group.add(mesh);

  const iceGeo = new THREE.CircleGeometry(70, 48);
  const iceMat = new THREE.MeshStandardMaterial({
    color: 0xc7d8e8,
    roughness: 0.3,
    metalness: 0.1,
    transparent: true,
    opacity: 0.8,
  });

  for (const [x, z, r] of [
    [-200, 280, 60],
    [330, -380, 75],
    [520, 250, 42],
    [-560, -120, 58],
  ]) {
    const ice = new THREE.Mesh(iceGeo, iceMat);
    ice.scale.setScalar(r / 70);
    ice.rotation.x = -Math.PI / 2;
    ice.position.set(x, terrainHeightAt(x, z) + 0.08, z);
    group.add(ice);
  }

  return group;
}
