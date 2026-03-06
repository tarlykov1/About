import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.163.0/build/three.module.js';
import { buildWorld } from './scene.js';
import { createPlayerControls } from './controls.js';
import { createWeather } from './weather.js';
import { createUI } from './ui.js';
import { terrainHeightAt } from './utils.js';

const app = document.getElementById('app');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
camera.position.set(0, terrainHeightAt(0, 0) + 1.7, 24);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
app.appendChild(renderer.domElement);

const world = buildWorld(scene, renderer);
const controls = createPlayerControls(camera, renderer.domElement);
scene.add(controls.controls.getObject());

const weather = createWeather(scene);
const ui = createUI({
  onStart: () => controls.lock(),
  onToggleTime: () => {
    world.environment.toggleMode();
    weather.toggle();
  },
});

const clock = new THREE.Clock();

function animate() {
  const dt = Math.min(clock.getDelta(), 0.05);

  if (controls.controls.isLocked) {
    controls.update(dt);
  }

  world.environment.update(dt);
  world.animals.update(dt);
  weather.update(dt, camera.position);
  ui.updatePlayer(camera.position);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
