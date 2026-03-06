window.YamalSim = window.YamalSim || {};

window.YamalSim.ui = (() => {
  function determineZone(x, z) {
    if (x < -120 && z > 60 && z < 250) return "МОДУЛЬНЫЙ ГОРОДОК";
    if (x > 120 && z > -20 && z < 190) return "СКЛАД ТРУБ";
    if (Math.abs(x) < 350 && Math.abs(z) < 300) return "СТРОЙПЛОЩАДКА";
    if (Math.hypot(x, z) > 640) return "ТУНДРА";
    return "ПРОМЗОНА";
  }

  function setupUI(game) {
    const overlay = document.getElementById("startOverlay");
    const startBtn = document.getElementById("startBtn");
    const coords = document.getElementById("coords");
    const zone = document.getElementById("zone");
    const weather = document.getElementById("weather");

    startBtn.addEventListener("click", () => {
      overlay.classList.remove("visible");
      game.controls.controls.lock();
    });

    game.controls.controls.addEventListener("unlock", () => {
      overlay.classList.add("visible");
    });

    function update(playerPos, weatherMode) {
      coords.textContent = `X: ${playerPos.x.toFixed(1)} | Y: ${playerPos.y.toFixed(1)} | Z: ${playerPos.z.toFixed(1)}`;
      zone.textContent = `Zone: ${determineZone(playerPos.x, playerPos.z)}`;
      weather.textContent = `Weather: ${weatherMode}`;
    }

    return {
      update,
    };
  }

  return {
    setupUI,
    determineZone,
  };
})();
