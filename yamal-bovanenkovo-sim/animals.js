window.YamalSim = window.YamalSim || {};

window.YamalSim.animals = (() => {
  const { rand, randInt } = window.YamalSim.utils;

  function createFox() {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0xf0f3f6, roughness: 0.95 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.55, 0.45), mat);
    body.position.y = 0.45;
    g.add(body);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.36, 0.34), mat);
    head.position.set(0.75, 0.6, 0);
    g.add(head);

    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.8, 6), mat);
    tail.rotation.z = -Math.PI / 2.2;
    tail.position.set(-0.78, 0.55, 0);
    g.add(tail);

    return g;
  }

  function createBear() {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0xe6ecef, roughness: 0.9 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.5, 1.3), mat);
    body.position.y = 1.3;
    g.add(body);

    const head = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.8, 0.8), mat);
    head.position.set(1.95, 1.6, 0);
    g.add(head);

    const hump = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.6, 1.0), mat);
    hump.position.set(0.4, 1.9, 0);
    g.add(hump);

    return g;
  }

  function createAnimals(terrain) {
    const group = new THREE.Group();
    group.name = "ArcticAnimals";
    const agents = [];

    const foxCount = 8;
    for (let i = 0; i < foxCount; i++) {
      const fox = createFox();
      const angle = rand(0, Math.PI * 2);
      const radius = rand(650, 980);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      fox.position.set(x, terrain.getHeightAt(x, z) + 0.02, z);
      fox.rotation.y = rand(0, Math.PI * 2);
      fox.scale.setScalar(rand(0.95, 1.15));
      group.add(fox);
      agents.push({ mesh: fox, speed: rand(0.6, 1.2), turnTimer: rand(1, 5), type: "fox" });
    }

    const bearCount = 2;
    for (let i = 0; i < bearCount; i++) {
      const bear = createBear();
      const angle = rand(0, Math.PI * 2);
      const radius = rand(840, 1100);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      bear.position.set(x, terrain.getHeightAt(x, z) + 0.05, z);
      bear.rotation.y = rand(0, Math.PI * 2);
      group.add(bear);
      agents.push({ mesh: bear, speed: rand(0.28, 0.45), turnTimer: rand(3, 8), type: "bear" });
    }

    return { group, agents };
  }

  function updateAnimals(state, terrain, delta) {
    state.agents.forEach((a) => {
      a.turnTimer -= delta;
      if (a.turnTimer <= 0) {
        a.mesh.rotation.y += rand(-0.8, 0.8);
        a.turnTimer = a.type === "fox" ? rand(1.5, 4.2) : rand(4.5, 10);
      }

      if (Math.random() < (a.type === "fox" ? 0.75 : 0.4) * delta) {
        const dirX = Math.sin(a.mesh.rotation.y);
        const dirZ = Math.cos(a.mesh.rotation.y);
        a.mesh.position.x += dirX * a.speed * delta;
        a.mesh.position.z += dirZ * a.speed * delta;

        const r = Math.hypot(a.mesh.position.x, a.mesh.position.z);
        if (r < 580 || r > 1200) {
          a.mesh.rotation.y += Math.PI * (randInt(0, 1) ? 0.85 : -0.85);
        }
      }

      a.mesh.position.y = terrain.getHeightAt(a.mesh.position.x, a.mesh.position.z) + (a.type === "fox" ? 0.02 : 0.05);
    });
  }

  return {
    createAnimals,
    updateAnimals,
  };
})();
