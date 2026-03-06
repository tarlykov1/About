window.YamalSim = window.YamalSim || {};

window.YamalSim.controls = (() => {
  const { clamp } = window.YamalSim.utils;

  function setupControls(camera, domElement, terrain) {
    const controls = new THREE.PointerLockControls(camera, domElement);
    const state = {
      controls,
      velocity: new THREE.Vector3(),
      direction: new THREE.Vector3(),
      keys: {
        KeyW: false,
        KeyA: false,
        KeyS: false,
        KeyD: false,
        ShiftLeft: false,
        Space: false,
      },
      canJump: false,
      eyeHeight: 1.7,
    };

    const onKey = (ev, down) => {
      if (state.keys.hasOwnProperty(ev.code)) state.keys[ev.code] = down;
      if (ev.code === "Space") ev.preventDefault();
    };

    window.addEventListener("keydown", (ev) => onKey(ev, true));
    window.addEventListener("keyup", (ev) => onKey(ev, false));

    controls.addEventListener("lock", () => {
      state.isLocked = true;
    });

    controls.addEventListener("unlock", () => {
      state.isLocked = false;
    });

    function update(delta) {
      if (!state.isLocked) return;

      const speed = state.keys.ShiftLeft ? 45 : 26;
      const damping = 10;

      state.velocity.x -= state.velocity.x * damping * delta;
      state.velocity.z -= state.velocity.z * damping * delta;
      state.velocity.y -= 30 * delta;

      state.direction.z = Number(state.keys.KeyW) - Number(state.keys.KeyS);
      state.direction.x = Number(state.keys.KeyD) - Number(state.keys.KeyA);
      state.direction.normalize();

      if (state.direction.z !== 0) state.velocity.z -= state.direction.z * speed * delta;
      if (state.direction.x !== 0) state.velocity.x -= state.direction.x * speed * delta;

      if (state.keys.Space && state.canJump) {
        state.velocity.y = 10.5;
        state.canJump = false;
      }

      controls.moveRight(-state.velocity.x * delta);
      controls.moveForward(-state.velocity.z * delta);
      controls.getObject().position.y += state.velocity.y * delta;

      const p = controls.getObject().position;
      const terrainY = terrain.getHeightAt(p.x, p.z) + state.eyeHeight;

      if (p.y < terrainY) {
        state.velocity.y = 0;
        p.y = terrainY;
        state.canJump = true;
      }

      p.y = clamp(p.y, terrainY, terrainY + 14);
    }

    return {
      controls,
      state,
      update,
    };
  }

  return {
    setupControls,
  };
})();
