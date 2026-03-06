window.YamalSim = window.YamalSim || {};

window.YamalSim.utils = (() => {
  const tmpVec3 = new THREE.Vector3();

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function randInt(min, max) {
    return Math.floor(rand(min, max + 1));
  }

  function hash2D(x, z) {
    const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453123;
    return s - Math.floor(s);
  }

  function smoothNoise2D(x, z) {
    const x0 = Math.floor(x);
    const z0 = Math.floor(z);
    const tx = x - x0;
    const tz = z - z0;

    const n00 = hash2D(x0, z0);
    const n10 = hash2D(x0 + 1, z0);
    const n01 = hash2D(x0, z0 + 1);
    const n11 = hash2D(x0 + 1, z0 + 1);

    const sx = tx * tx * (3 - 2 * tx);
    const sz = tz * tz * (3 - 2 * tz);

    const nx0 = n00 * (1 - sx) + n10 * sx;
    const nx1 = n01 * (1 - sx) + n11 * sx;
    return nx0 * (1 - sz) + nx1 * sz;
  }

  function fbmNoise(x, z, octaves = 4) {
    let amplitude = 1;
    let frequency = 1;
    let sum = 0;
    let norm = 0;

    for (let i = 0; i < octaves; i++) {
      sum += smoothNoise2D(x * frequency, z * frequency) * amplitude;
      norm += amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }

    return sum / norm;
  }

  function distance2D(ax, az, bx, bz) {
    const dx = ax - bx;
    const dz = az - bz;
    return Math.hypot(dx, dz);
  }

  function lookAtYaw(from, to) {
    tmpVec3.copy(to).sub(from);
    return Math.atan2(tmpVec3.x, tmpVec3.z);
  }

  return {
    clamp,
    lerp,
    rand,
    randInt,
    smoothNoise2D,
    fbmNoise,
    distance2D,
    lookAtYaw,
  };
})();
