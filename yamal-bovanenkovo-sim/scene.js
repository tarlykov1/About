window.YamalSim = window.YamalSim || {};

window.YamalSim.scene = (() => {
  function buildRenderer() {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);
    return renderer;
  }

  function createScene() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2500);
    camera.position.set(-240, 8, 80);

    const renderer = buildRenderer();
    const terrain = window.YamalSim.terrain;

    const terrainMesh = terrain.createTerrain();
    scene.add(terrainMesh);

    const env = window.YamalSim.environment.setupEnvironment(scene);

    const roads = window.YamalSim.roads.createRoadNetwork(terrain);
    scene.add(roads);

    const camp = window.YamalSim.buildings.createCamp(terrain);
    scene.add(camp);

    const constr = window.YamalSim.construction.createConstructionZones(terrain, scene);
    scene.add(constr.group);

    const animals = window.YamalSim.animals.createAnimals(terrain);
    scene.add(animals.group);

    const weather = window.YamalSim.weather.createSnowSystem(2600);
    scene.add(weather.points);

    const controls = window.YamalSim.controls.setupControls(camera, renderer.domElement, terrain);
    scene.add(controls.controls.getObject());

    controls.controls.getObject().position.set(-240, terrain.getHeightAt(-240, 80) + 1.7, 80);

    const game = {
      scene,
      camera,
      renderer,
      terrain,
      environment: env,
      controls,
      weather,
      animals,
      floodlights: constr.lights,
      ui: null,
      lastTime: performance.now(),
      autoCycle: true,
    };

    window.addEventListener("resize", () => {
      game.camera.aspect = window.innerWidth / window.innerHeight;
      game.camera.updateProjectionMatrix();
      game.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    window.addEventListener("keydown", (ev) => {
      if (ev.code === "KeyT") {
        const next = game.environment.timeMode === "day" ? "dusk" : "day";
        window.YamalSim.environment.setMode(game.environment, game.scene, next);
      }
    });

    return game;
  }

  function updateFloodlights(game, delta) {
    const evening = game.environment.timeMode === "dusk";
    game.floodlights.forEach((l) => {
      const targetIntensity = evening ? 1.15 : 0.55;
      l.intensity += (targetIntensity - l.intensity) * Math.min(delta * 2.5, 1);
      l.distance = evening ? 150 : 100;
    });
  }

  function animate(game) {
    const now = performance.now();
    const delta = Math.min((now - game.lastTime) / 1000, 0.05);
    game.lastTime = now;

    game.controls.update(delta);
    window.YamalSim.environment.updateEnvironment(game.environment, game.scene, delta, game.autoCycle);
    window.YamalSim.weather.updateWeather(game.weather, game.scene, game.controls.controls.getObject().position, delta * 60);
    window.YamalSim.animals.updateAnimals(game.animals, game.terrain, delta * 60);
    updateFloodlights(game, delta);

    if (game.ui) {
      game.ui.update(game.controls.controls.getObject().position, game.weather.mode);
    }

    game.renderer.render(game.scene, game.camera);
    requestAnimationFrame(() => animate(game));
  }

  return {
    createScene,
    animate,
  };
})();
