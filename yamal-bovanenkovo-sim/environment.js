import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.163.0/build/three.module.js';
import { terrainHeightAt } from './utils.js';

export function setupEnvironment(scene, renderer) {
  scene.background = new THREE.Color(0xaebfd0);
  scene.fog = new THREE.Fog(0xb8c8d6, 200, 980);

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const hemi = new THREE.HemisphereLight(0xd8e5f2, 0x56626f, 0.8);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xe6edf4, 0.95);
  sun.position.set(-120, 220, 120);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -300;
  sun.shadow.camera.right = 300;
  sun.shadow.camera.top = 300;
  sun.shadow.camera.bottom = -300;
  scene.add(sun);

  const ambient = new THREE.AmbientLight(0x8f9fb0, 0.35);
  scene.add(ambient);

  const horizon = new THREE.Mesh(
    new THREE.CylinderGeometry(1020, 1080, 65, 48, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xa3b4c2, side: THREE.BackSide, transparent: true, opacity: 0.5 })
  );
  horizon.position.y = terrainHeightAt(0, 0) + 28;
  scene.add(horizon);

  const presets = {
    day: { bg: 0xaebfd0, fog: 0xb8c8d6, sunI: 0.95, sun: [-120, 220, 120], hemi: 0.8, amb: 0.35 },
    dusk: { bg: 0x7f8fa2, fog: 0x8d9aab, sunI: 0.4, sun: [-80, 120, 30], hemi: 0.45, amb: 0.5 },
  };

  const applyMode = (mode) => {
    const p = presets[mode];
    scene.background.set(p.bg);
    scene.fog.color.set(p.fog);
    sun.intensity = p.sunI;
    sun.position.set(p.sun[0], p.sun[1], p.sun[2]);
    hemi.intensity = p.hemi;
    ambient.intensity = p.amb;
  };

  return {
    hemi,
    sun,
    ambient,
    mode: 'day',
    autoCycleTime: 0,
    getTimeLabel() {
      return this.mode === 'day' ? 'ДЕНЬ' : 'СУМЕРКИ';
    },
    toggleMode() {
      this.mode = this.mode === 'day' ? 'dusk' : 'day';
      applyMode(this.mode);
      this.autoCycleTime = 0;
    },
    update(dt) {
      this.autoCycleTime += dt;
      if (this.autoCycleTime > 210) this.toggleMode();
      const drift = Math.sin(performance.now() * 0.00003) * 6;
      this.sun.position.z = (this.mode === 'day' ? 120 : 30) + drift;
    },
  };
}

export function createFloodLight(x, z, y = null) {
  const h = y ?? terrainHeightAt(x, z);
  const group = new THREE.Group();
  group.position.set(x, h, z);

  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.65, 18, 12),
    new THREE.MeshStandardMaterial({ color: 0x4a535c, metalness: 0.7, roughness: 0.35 })
  );
  mast.position.y = 9;
  group.add(mast);

  const rig = new THREE.Mesh(
    new THREE.BoxGeometry(4.5, 0.4, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x616d78, metalness: 0.6, roughness: 0.4 })
  );
  rig.position.y = 17.5;
  group.add(rig);

  const lampMat = new THREE.MeshStandardMaterial({ color: 0xe8ddb3, emissive: 0xc6b980, emissiveIntensity: 0.6 });
  for (const sx of [-1.6, 0, 1.6]) {
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 0.8), lampMat);
    lamp.position.set(sx, 17.2, 0.4);
    group.add(lamp);
  }

  const spot = new THREE.SpotLight(0xd9d1b2, 0.4, 80, Math.PI / 5, 0.5, 1.8);
  spot.position.set(0, 17.1, 0.6);
  spot.target.position.set(0, 0, 12);
  spot.castShadow = false;
  group.add(spot, spot.target);

  return group;
}
