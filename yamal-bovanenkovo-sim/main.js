window.addEventListener("DOMContentLoaded", () => {
  const game = window.YamalSim.scene.createScene();
  game.ui = window.YamalSim.ui.setupUI(game);
  window.YamalSim.scene.animate(game);
});
