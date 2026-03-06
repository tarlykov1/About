window.YamalSim = window.YamalSim || {};

window.YamalSim.construction = (() => {
  function vehicleBulldozer() {
    const g = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(6.2, 2.2, 4),
      new THREE.MeshStandardMaterial({ color: 0xc9a137, roughness: 0.75 })
    );
    body.position.y = 2;
    g.add(body);

    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 1.6, 2.3),
      new THREE.MeshStandardMaterial({ color: 0x4f5d66, roughness: 0.6 })
    );
    cabin.position.set(0.8, 3, 0);
    g.add(cabin);

    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(6.4, 1.4, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x69737a, roughness: 0.8 })
    );
    blade.position.set(0, 1.2, 2.3);
    g.add(blade);

    const trackGeo = new THREE.BoxGeometry(6.6, 0.8, 0.9);
    const trackMat = new THREE.MeshStandardMaterial({ color: 0x2e3439, roughness: 0.95 });
    const t1 = new THREE.Mesh(trackGeo, trackMat);
    t1.position.set(0, 0.6, 1.6);
    const t2 = t1.clone();
    t2.position.z = -1.6;
    g.add(t1, t2);
    return g;
  }

  function vehicleDumpTruck() {
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(8, 1.5, 3.5), new THREE.MeshStandardMaterial({ color: 0x4b565f }));
    base.position.y = 1.5;
    g.add(base);

    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.1, 3.3), new THREE.MeshStandardMaterial({ color: 0xc68f3a }));
    cab.position.set(-2.4, 2.7, 0);
    g.add(cab);

    const bed = new THREE.Mesh(new THREE.BoxGeometry(4.6, 1.9, 3.1), new THREE.MeshStandardMaterial({ color: 0x7d878f }));
    bed.position.set(1.6, 2.8, 0);
    g.add(bed);

    const wheelGeo = new THREE.CylinderGeometry(0.72, 0.72, 0.55, 12);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1f2327 });
    for (let x = -2.6; x <= 2.6; x += 2.6) {
      for (let z = -1.7; z <= 1.7; z += 3.4) {
        const w = new THREE.Mesh(wheelGeo, wheelMat);
        w.rotation.z = Math.PI / 2;
        w.position.set(x, 0.75, z);
        g.add(w);
      }
    }
    return g;
  }

  function vehicleCrawlerCrane() {
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(7.2, 2, 4.2), new THREE.MeshStandardMaterial({ color: 0xb68234 }));
    base.position.y = 2;
    g.add(base);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.4, 2.2), new THREE.MeshStandardMaterial({ color: 0x5a6874 }));
    cabin.position.set(-1.5, 4, 0);
    g.add(cabin);

    const boom = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 18), new THREE.MeshStandardMaterial({ color: 0x7a858f }));
    boom.position.set(2, 6.4, -5);
    boom.rotation.x = Math.PI * 0.18;
    g.add(boom);

    const track = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.8, 1), new THREE.MeshStandardMaterial({ color: 0x2c3338 }));
    track.position.set(0, 0.6, 1.8);
    const track2 = track.clone();
    track2.position.z = -1.8;
    g.add(track, track2);
    return g;
  }

  function vehiclePipeLayer() {
    const g = vehicleBulldozer();
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4.8, 0.4), new THREE.MeshStandardMaterial({ color: 0x7f8b96 }));
    arm.position.set(1.6, 4.4, -1.8);
    g.add(arm);
    const hook = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.1, 8, 16), new THREE.MeshStandardMaterial({ color: 0x2f363d }));
    hook.position.set(1.6, 2.4, -1.8);
    g.add(hook);
    return g;
  }

  function vehicleATV() {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.2, 2), new THREE.MeshStandardMaterial({ color: 0x67755a }));
    body.position.y = 1.5;
    g.add(body);

    const top = new THREE.Mesh(new THREE.BoxGeometry(2, 0.9, 1.7), new THREE.MeshStandardMaterial({ color: 0x4d5b4f }));
    top.position.set(0, 2.2, 0);
    g.add(top);

    const wheelGeo = new THREE.CylinderGeometry(0.46, 0.46, 0.36, 10);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x23272c });
    for (let x = -1.3; x <= 1.3; x += 2.6) {
      for (let z = -1.1; z <= 1.1; z += 2.2) {
        const w = new THREE.Mesh(wheelGeo, wheelMat);
        w.rotation.z = Math.PI / 2;
        w.position.set(x, 0.7, z);
        g.add(w);
      }
    }

    return g;
  }

  function makePipeStack(length = 18, count = 5, spacing = 1.35) {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0x5f6972, roughness: 0.8, metalness: 0.2 });
    const pipeGeo = new THREE.CylinderGeometry(0.55, 0.55, length, 16);

    for (let row = 0; row < 3; row++) {
      for (let i = 0; i < count; i++) {
        const p = new THREE.Mesh(pipeGeo, mat);
        p.rotation.z = Math.PI / 2;
        p.position.set((i - count * 0.5) * spacing, 0.55 + row * 1.05, row % 2 ? 0.62 : 0);
        p.castShadow = true;
        p.receiveShadow = true;
        g.add(p);
      }
    }

    return g;
  }

  function floodlightPole() {
    const g = new THREE.Group();
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.3, 13, 8),
      new THREE.MeshStandardMaterial({ color: 0x596672 })
    );
    pole.position.y = 6.5;
    g.add(pole);

    const bar = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.2, 0.2), new THREE.MeshStandardMaterial({ color: 0x6c7884 }));
    bar.position.set(0, 12.3, 0);
    g.add(bar);

    const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.35, 0.4), new THREE.MeshStandardMaterial({ color: 0xa2b2c1, emissive: 0xf8edcc, emissiveIntensity: 0.2 }));
    lamp.position.set(0.8, 12.1, 0);
    const lamp2 = lamp.clone();
    lamp2.position.x = -0.8;
    g.add(lamp, lamp2);

    return g;
  }

  function createConstructionZones(terrain, scene) {
    const group = new THREE.Group();
    group.name = "ConstructionZones";

    const placement = [
      [vehicleBulldozer(), 70, -80, 0.4],
      [vehicleDumpTruck(), 110, -130, -0.2],
      [vehicleCrawlerCrane(), 140, -40, 0.9],
      [vehiclePipeLayer(), 210, -190, 1.7],
      [vehicleDumpTruck(), 260, -150, 0.5],
      [vehicleATV(), -40, -70, 0.2],
      [vehicleATV(), -300, 140, -1.2],
    ];

    placement.forEach(([mesh, x, z, ry]) => {
      mesh.position.set(x, terrain.getHeightAt(x, z), z);
      mesh.rotation.y = ry;
      mesh.traverse((o) => {
        if (o.isMesh) {
          o.castShadow = true;
          o.receiveShadow = true;
        }
      });
      group.add(mesh);
    });

    for (let i = 0; i < 9; i++) {
      const stack = makePipeStack(20, 6, 1.4);
      const x = 180 + (i % 3) * 34;
      const z = 40 + Math.floor(i / 3) * 26;
      stack.position.set(x, terrain.getHeightAt(x, z), z);
      stack.rotation.y = i % 2 ? Math.PI / 2 : 0;
      group.add(stack);
    }

    for (let i = 0; i < 12; i++) {
      const cont = new THREE.Mesh(
        new THREE.BoxGeometry(7, 2.9, 2.9),
        new THREE.MeshStandardMaterial({ color: i % 3 === 0 ? 0x6f808f : 0x7e8e9a, roughness: 0.88 })
      );
      const x = 40 + (i % 6) * 9;
      const z = -220 + Math.floor(i / 6) * 4;
      cont.position.set(x, terrain.getHeightAt(x, z) + 1.45, z);
      cont.castShadow = true;
      cont.receiveShadow = true;
      group.add(cont);
    }

    const mastPositions = [
      [0, -130], [130, -90], [230, -40], [230, 80], [90, 140], [-80, 30], [-250, 150],
    ];

    const lights = [];
    mastPositions.forEach((p) => {
      const pole = floodlightPole();
      pole.position.set(p[0], terrain.getHeightAt(p[0], p[1]), p[1]);
      group.add(pole);

      const light = new THREE.SpotLight(0xdde8f8, 0.7, 120, Math.PI / 5, 0.5, 1.2);
      light.position.set(p[0], pole.position.y + 12.2, p[1]);
      light.target.position.set(p[0], terrain.getHeightAt(p[0], p[1]), p[1]);
      light.castShadow = false;
      scene.add(light.target);
      scene.add(light);
      lights.push(light);
    });

    return { group, lights };
  }

  return {
    createConstructionZones,
  };
})();
