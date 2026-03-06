window.YamalSim = window.YamalSim || {};

window.YamalSim.buildings = (() => {
  const C = {
    wallLight: 0xcdd8e1,
    wallBlue: 0x8ea0b2,
    roofDark: 0x4a5968,
    trim: 0x6a7a89,
    window: 0xadc7de,
  };

  function makeModule({ w = 22, h = 6, d = 10, color = C.wallLight, roof = C.roofDark }) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshStandardMaterial({ color, roughness: 0.93, metalness: 0.05 })
    );
    body.position.y = h * 0.5;
    body.castShadow = true;
    body.receiveShadow = true;
    g.add(body);

    const roofMesh = new THREE.Mesh(
      new THREE.BoxGeometry(w + 0.6, 0.6, d + 0.6),
      new THREE.MeshStandardMaterial({ color: roof, roughness: 0.82 })
    );
    roofMesh.position.y = h + 0.28;
    roofMesh.castShadow = true;
    g.add(roofMesh);

    const windowMat = new THREE.MeshStandardMaterial({ color: C.window, emissive: 0x2f4c67, emissiveIntensity: 0.18 });
    const windowGeo = new THREE.BoxGeometry(1.8, 1.2, 0.1);
    for (let i = -3; i <= 3; i++) {
      if (i === 0) continue;
      const wx = (w / 8) * i;
      const win = new THREE.Mesh(windowGeo, windowMat);
      win.position.set(wx, h * 0.58, d / 2 + 0.06);
      g.add(win);
    }

    const stairs = new THREE.Mesh(
      new THREE.BoxGeometry(3.3, 0.8, 2.6),
      new THREE.MeshStandardMaterial({ color: C.trim, roughness: 0.95 })
    );
    stairs.position.set(0, 0.4, d / 2 + 1.3);
    stairs.receiveShadow = true;
    g.add(stairs);

    return g;
  }

  function makeFenceLine(length = 120) {
    const g = new THREE.Group();
    const postGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.2, 6);
    const postMat = new THREE.MeshStandardMaterial({ color: 0x69737d, roughness: 0.9 });

    for (let i = 0; i <= length / 6; i++) {
      const x = -length / 2 + i * 6;
      const p = new THREE.Mesh(postGeo, postMat);
      p.position.set(x, 1.1, 0);
      g.add(p);

      if (i < length / 6) {
        const rail = new THREE.Mesh(
          new THREE.BoxGeometry(6, 0.08, 0.08),
          new THREE.MeshStandardMaterial({ color: 0x7b868f })
        );
        rail.position.set(x + 3, 1.5, 0);
        g.add(rail);
      }
    }

    return g;
  }

  function createCamp(terrain) {
    const group = new THREE.Group();
    group.name = "ModularCamp";

    const rows = [
      { z: 120, count: 5, color: C.wallLight },
      { z: 150, count: 5, color: C.wallBlue },
      { z: 182, count: 5, color: C.wallLight },
    ];

    rows.forEach((row, rIdx) => {
      for (let i = 0; i < row.count; i++) {
        const mod = makeModule({ color: row.color, roof: rIdx % 2 ? 0x485764 : 0x556777 });
        const x = -380 + i * 56;
        const z = row.z;
        mod.position.set(x, terrain.getHeightAt(x, z), z);
        group.add(mod);
      }
    });

    const hq = makeModule({ w: 44, h: 7, d: 16, color: 0x9aa9b6, roof: 0x3f4e5f });
    hq.position.set(-220, terrain.getHeightAt(-220, 78), 78);
    group.add(hq);

    const checkpoint = makeModule({ w: 14, h: 5, d: 8, color: 0xa5b4c2, roof: 0x4c5c6a });
    checkpoint.position.set(-430, terrain.getHeightAt(-430, 98), 98);
    group.add(checkpoint);

    for (let i = 0; i < 16; i++) {
      const c = new THREE.Mesh(
        new THREE.BoxGeometry(6, 2.6, 2.6),
        new THREE.MeshStandardMaterial({ color: i % 2 ? 0x8897a4 : 0x6f7f8d, roughness: 0.9 })
      );
      const x = -440 + (i % 8) * 10;
      const z = 212 + Math.floor(i / 8) * 4;
      c.position.set(x, terrain.getHeightAt(x, z) + 1.3, z);
      c.castShadow = true;
      c.receiveShadow = true;
      group.add(c);
    }

    const fenceA = makeFenceLine(280);
    fenceA.position.set(-250, terrain.getHeightAt(-250, 92), 92);
    group.add(fenceA);

    const fenceB = makeFenceLine(280);
    fenceB.position.set(-250, terrain.getHeightAt(-250, 206), 206);
    group.add(fenceB);

    return group;
  }

  return {
    createCamp,
  };
})();
