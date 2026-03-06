window.YamalSim = window.YamalSim || {};

window.YamalSim.terrain = (() => {
  const { fbmNoise, clamp } = window.YamalSim.utils;

  const TERRAIN_SIZE = 2200;
  const TERRAIN_SEGMENTS = 260;

  function getHeightAt(x, z) {
    const base = (fbmNoise(x * 0.0022, z * 0.0022, 5) - 0.5) * 10.0;
    const details = (fbmNoise((x + 300) * 0.007, (z - 190) * 0.007, 3) - 0.5) * 1.9;
    const hills = (fbmNoise((x - 700) * 0.0012, (z + 120) * 0.0012, 4) - 0.5) * 20;

    const flattenSite = Math.exp(-((x * x + z * z) / (900 * 900)));
    const siteOffset = flattenSite * -2.2;

    return clamp(base + details + hills + siteOffset, -9, 18);
  }

  function createTerrain() {
    const geometry = new THREE.PlaneGeometry(TERRAIN_SIZE, TERRAIN_SIZE, TERRAIN_SEGMENTS, TERRAIN_SEGMENTS);
    geometry.rotateX(-Math.PI / 2);

    const pos = geometry.attributes.position;
    const colors = [];
    const color = new THREE.Color();

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = getHeightAt(x, z);
      pos.setY(i, h);

      const n = (h + 10) / 28;
      color.setRGB(
        0.84 - n * 0.09,
        0.88 - n * 0.07,
        0.93 - n * 0.1
      );

      if (Math.abs(x) < 360 && Math.abs(z) < 260) {
        color.lerp(new THREE.Color(0.75, 0.77, 0.79), 0.34);
      }

      colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.93,
      metalness: 0.02,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;

    return mesh;
  }

  return {
    createTerrain,
    getHeightAt,
    TERRAIN_SIZE,
  };
})();
