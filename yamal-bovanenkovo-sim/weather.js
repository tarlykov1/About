window.YamalSim = window.YamalSim || {};

window.YamalSim.weather = (() => {
  const { rand, lerp } = window.YamalSim.utils;

  function createSnowSystem(count = 2400) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = rand(-750, 750);
      positions[i * 3 + 1] = rand(3, 130);
      positions[i * 3 + 2] = rand(-750, 750);
      speeds[i] = rand(0.8, 2.4);
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xe9f2fd,
      size: 0.7,
      transparent: true,
      opacity: 0.68,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;

    return {
      points,
      speeds,
      intensity: 0.3,
      stateTimer: 0,
      mode: "Light Snow",
      wind: new THREE.Vector2(0.6, 0.2),
    };
  }

  function updateWeather(weather, scene, playerPosition, delta) {
    weather.stateTimer += delta;
    const p = weather.points.geometry.attributes.position.array;

    if (weather.stateTimer > 22) {
      weather.stateTimer = 0;
      const r = Math.random();
      if (r < 0.45) {
        weather.mode = "Light Snow";
        weather.intensity = 0.28;
      } else if (r < 0.85) {
        weather.mode = "Normal Visibility";
        weather.intensity = 0.18;
      } else {
        weather.mode = "Snow Mist";
        weather.intensity = 0.5;
      }
    }

    weather.wind.x = lerp(weather.wind.x, Math.sin(performance.now() * 0.00019) * 1.7, delta * 0.2);
    weather.wind.y = lerp(weather.wind.y, Math.cos(performance.now() * 0.00015) * 1.2, delta * 0.2);

    for (let i = 0; i < weather.speeds.length; i++) {
      const idx = i * 3;
      p[idx] += weather.wind.x * 0.03 * weather.speeds[i] * delta;
      p[idx + 2] += weather.wind.y * 0.03 * weather.speeds[i] * delta;
      p[idx + 1] -= weather.speeds[i] * weather.intensity * delta;

      const localX = p[idx] - playerPosition.x;
      const localZ = p[idx + 2] - playerPosition.z;
      if (p[idx + 1] < 0 || Math.abs(localX) > 900 || Math.abs(localZ) > 900) {
        p[idx] = playerPosition.x + rand(-700, 700);
        p[idx + 1] = rand(40, 130);
        p[idx + 2] = playerPosition.z + rand(-700, 700);
      }
    }

    weather.points.geometry.attributes.position.needsUpdate = true;

    if (weather.mode === "Snow Mist") {
      scene.fog.near = lerp(scene.fog.near, 90, delta * 0.6);
      scene.fog.far = lerp(scene.fog.far, 740, delta * 0.6);
    } else if (weather.mode === "Normal Visibility") {
      scene.fog.near = lerp(scene.fog.near, 170, delta * 0.6);
      scene.fog.far = lerp(scene.fog.far, 1260, delta * 0.6);
    } else {
      scene.fog.near = lerp(scene.fog.near, 130, delta * 0.6);
      scene.fog.far = lerp(scene.fog.far, 1040, delta * 0.6);
    }
  }

  return {
    createSnowSystem,
    updateWeather,
  };
})();
