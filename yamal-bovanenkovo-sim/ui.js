import { worldZoneLabel } from './utils.js';

export function createUI({ onStart, onToggleTime, autoStart = false }) {
  const overlay = document.getElementById('start-overlay');
  const startBtn = document.getElementById('start-btn');
  const zoneEl = document.getElementById('hud-zone');
  const statusEl = document.getElementById('hud-status');
  const coordsEl = document.getElementById('hud-coords');
  const timeEl = document.getElementById('hud-time');
  const weatherEl = document.getElementById('hud-weather');
  const toggleTime = document.getElementById('toggle-time');
  let started = false;

  const startGame = (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (started) return;
    started = true;

    if (overlay) overlay.classList.add('overlay--hidden');
    document.body.classList.add('game-started');
    onStart();
  };

  document.addEventListener('yamal:start-requested', startGame);

  // hard fallback for environments where button listeners are lost/blocked
  document.addEventListener(
    'pointerdown',
    (event) => {
      if (event.target && event.target.closest && event.target.closest('#start-btn')) {
        startGame(event);
      }
    },
    { capture: true }
  );

  if (startBtn) {
    startBtn.addEventListener('click', startGame);
    startBtn.addEventListener('pointerup', startGame);
    startBtn.addEventListener('touchend', startGame, { passive: false });
    startBtn.addEventListener('keydown', (e) => {
      if (e.code === 'Enter' || e.code === 'Space') startGame(e);
    });
  }

  // fallback: allow start by clicking overlay background too
  if (overlay) overlay.addEventListener('dblclick', startGame);

  if (autoStart) {
    requestAnimationFrame(() => startGame());
  }

  toggleTime.addEventListener('click', onToggleTime);

  return {
    updatePlayer(position, worldInfo) {
      const zone = worldZoneLabel(position);
      zoneEl.textContent = `Zone: ${zone.zone}`;
      statusEl.textContent = `СТАТУС: ${zone.status}`;
      coordsEl.textContent = `X: ${position.x.toFixed(1)} | Y: ${position.y.toFixed(1)} | Z: ${position.z.toFixed(1)}`;
      if (worldInfo) {
        timeEl.textContent = `Освещение: ${worldInfo.timeLabel}`;
        weatherEl.textContent = `Погода: ${worldInfo.weatherLabel}`;
      }
    },
  };
}
