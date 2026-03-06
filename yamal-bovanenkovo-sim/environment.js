window.YamalSim = window.YamalSim || {};

window.YamalSim.environment = (() => {
  function createSkyDome() {
    const geo = new THREE.SphereGeometry(1900, 32, 16);
    const mat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        topColor: { value: new THREE.Color(0x889eb5) },
        bottomColor: { value: new THREE.Color(0xd3dce8) },
        offset: { value: 120 },
        exponent: { value: 0.7 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + offset).y;
          float t = max(pow(max(h, 0.0), exponent), 0.0);
          gl_FragColor = vec4(mix(bottomColor, topColor, t), 1.0);
        }
      `,
    });

    return new THREE.Mesh(geo, mat);
  }

  function setupEnvironment(scene) {
    scene.fog = new THREE.Fog(0xb7c4d2, 130, 1150);

    const ambient = new THREE.HemisphereLight(0xdbe7f4, 0x6f7780, 0.72);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xdfe8f5, 0.82);
    sun.position.set(180, 250, 120);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -380;
    sun.shadow.camera.right = 380;
    sun.shadow.camera.top = 380;
    sun.shadow.camera.bottom = -380;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 900;
    scene.add(sun);

    const sky = createSkyDome();
    scene.add(sky);

    return {
      ambient,
      sun,
      sky,
      timeMode: "day",
      timer: 0,
    };
  }

  function setMode(state, scene, mode) {
    state.timeMode = mode;
    if (mode === "day") {
      state.sun.intensity = 0.84;
      state.sun.color.set(0xdfebf8);
      state.ambient.intensity = 0.72;
      scene.fog.color.set(0xb7c4d2);
      scene.fog.near = 140;
      scene.fog.far = 1180;
      state.sky.material.uniforms.topColor.value.set(0x869bb1);
      state.sky.material.uniforms.bottomColor.value.set(0xd4deea);
    } else {
      state.sun.intensity = 0.45;
      state.sun.color.set(0xb7c9e0);
      state.ambient.intensity = 0.5;
      scene.fog.color.set(0x94a4b8);
      scene.fog.near = 110;
      scene.fog.far = 920;
      state.sky.material.uniforms.topColor.value.set(0x617992);
      state.sky.material.uniforms.bottomColor.value.set(0xaebbcf);
    }
  }

  function updateEnvironment(state, scene, delta, autoCycle = true) {
    state.timer += delta;
    if (autoCycle && state.timer > 65) {
      const next = state.timeMode === "day" ? "dusk" : "day";
      setMode(state, scene, next);
      state.timer = 0;
    }

    const t = performance.now() * 0.00007;
    state.sun.position.x = Math.cos(t) * 240;
    state.sun.position.z = Math.sin(t) * 180;
  }

  return {
    setupEnvironment,
    updateEnvironment,
    setMode,
  };
})();
