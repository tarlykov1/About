import { worldZoneLabel } from './utils.js';

export function createUI({ onStart, onToggleTime }) {
  const overlay = document.getElementById('start-overlay');
  const startBtn = document.getElementById('start-btn');
  const zoneEl = document.getElementById('hud-zone');
  const statusEl = document.getElementById('hud-status');
  const coordsEl = document.getElementById('hud-coords');
  const toggleTime = document.getElementById('toggle-time');

  startBtn.addEventListener('click', () => {
    overlay.classList.add('overlay--hidden');
    onStart();
  });

  toggleTime.addEventListener('click', onToggleTime);

  return {
    updatePlayer(position) {
      const zone = worldZoneLabel(position);
      zoneEl.textContent = `Zone: ${zone.zone}`;
      statusEl.textContent = `СТАТУС: ${zone.status}`;
      coordsEl.textContent = `X: ${position.x.toFixed(1)} | Y: ${position.y.toFixed(1)} | Z: ${position.z.toFixed(1)}`;
    },
  };
}
