window.YamalSim = window.YamalSim || {};

window.YamalSim.roads = (() => {
  function roadSegment(length, width, color = 0x8f9498) {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(width, length),
      new THREE.MeshStandardMaterial({ color, roughness: 1, metalness: 0 })
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    return mesh;
  }

  function createRoadNetwork(terrain) {
    const group = new THREE.Group();
    group.name = "RoadNetwork";

    const main = roadSegment(1050, 26, 0x8a8f93);
    main.position.set(40, terrain.getHeightAt(40, 0) + 0.25, 0);
    group.add(main);

    const branch1 = roadSegment(460, 16, 0x858b8f);
    branch1.position.set(-120, terrain.getHeightAt(-120, -190) + 0.2, -190);
    branch1.rotation.y = Math.PI / 2.8;
    group.add(branch1);

    const branch2 = roadSegment(620, 18, 0x83888c);
    branch2.position.set(190, terrain.getHeightAt(190, 160) + 0.2, 160);
    branch2.rotation.y = -Math.PI / 3.2;
    group.add(branch2);

    const campRoad = roadSegment(320, 14, 0x8f9499);
    campRoad.position.set(-260, terrain.getHeightAt(-260, 120) + 0.18, 120);
    campRoad.rotation.y = -Math.PI / 2;
    group.add(campRoad);

    for (let i = 0; i < 18; i++) {
      const mark = new THREE.Mesh(
        new THREE.PlaneGeometry(1.2, 7),
        new THREE.MeshBasicMaterial({ color: 0xc8ced3, transparent: true, opacity: 0.42 })
      );
      mark.rotation.x = -Math.PI / 2;
      mark.position.set(40, terrain.getHeightAt(40, -500 + i * 56) + 0.29, -500 + i * 56);
      group.add(mark);
    }

    return group;
  }

  return {
    createRoadNetwork,
  };
})();
