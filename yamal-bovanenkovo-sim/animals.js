import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.163.0/build/three.module.js';
import { terrainHeightAt, seededRandom } from './utils.js';

function createFoxModel() {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0xf3f7fa, roughness: 0.8 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.7, 0.5), mat);
  body.position.y = 0.55;
  g.add(body);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.45, 0.38), mat);
  head.position.set(0.9, 0.75, 0);
  g.add(head);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.9, 8), mat);
  tail.rotation.z = -1.2;
  tail.position.set(-0.9, 0.75, 0);
  g.add(tail);
  return g;
}

function createBearModel() {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0xe7edf2, roughness: 0.85 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.6, 1.2), mat);
  body.position.y = 1.2;
  g.add(body);
  const head = new THREE.Mesh(new THREE.BoxGeometry(1, 0.9, 0.9), mat);
  head.position.set(1.9, 1.6, 0);
  g.add(head);
  return g;
}

export function createAnimals() {
  const rng = seededRandom(202504);
  const group = new THREE.Group();
  const movers = [];
  const dir = new THREE.Vector3();

  // rare foxes in outer zones
  for (let i = 0; i < 9; i++) {
    const r = 480 + rng() * 560;
    const a = rng() * Math.PI * 2;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const fox = createFoxModel();
    fox.position.set(x, terrainHeightAt(x, z) + 0.05, z);
    fox.rotation.y = rng() * Math.PI * 2;
    group.add(fox);
    movers.push({ mesh: fox, speed: 0.45 + rng() * 0.3, turnTimer: rng() * 5, turnRate: 0.35 });
  }

  // very rare polar bears
  for (let i = 0; i < 3; i++) {
    const r = 740 + rng() * 380;
    const a = rng() * Math.PI * 2;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const bear = createBearModel();
    bear.position.set(x, terrainHeightAt(x, z) + 0.05, z);
    bear.rotation.y = rng() * Math.PI * 2;
    group.add(bear);
    movers.push({ mesh: bear, speed: 0.2 + rng() * 0.1, turnTimer: rng() * 9, turnRate: 0.15 });
  }

  return {
    group,
    update(dt) {
      movers.forEach((a) => {
        a.turnTimer -= dt;
        if (a.turnTimer <= 0) {
          a.turnTimer = 4 + Math.random() * 8;
          a.mesh.rotation.y += (Math.random() - 0.5) * a.turnRate * 5;
        }
        dir.set(Math.sin(a.mesh.rotation.y), 0, Math.cos(a.mesh.rotation.y));
        a.mesh.position.addScaledVector(dir, a.speed * dt);
        a.mesh.position.y = terrainHeightAt(a.mesh.position.x, a.mesh.position.z) + 0.05;
      });
    },
  };
}
