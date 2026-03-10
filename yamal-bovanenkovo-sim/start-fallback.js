(function () {
  function triggerStart(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    var overlay = document.getElementById('start-overlay');
    if (overlay) overlay.classList.add('overlay--hidden');

    document.body.classList.add('game-started');
    document.dispatchEvent(new CustomEvent('yamal:start-requested'));

    var canvas = document.querySelector('#app canvas');
    if (canvas && canvas.requestPointerLock && document.pointerLockElement !== canvas) {
      try {
        var result = canvas.requestPointerLock();
        if (result && typeof result.catch === 'function') result.catch(function () {});
      } catch (_e) {}
    }
  }

  function onAnyStartHit(event) {
    var target = event.target;
    if (target && target.closest && target.closest('#start-btn')) {
      triggerStart(event);
    }
  }

  function bind() {
    var btn = document.getElementById('start-btn');
    if (!btn || btn.dataset.boundStart === '1') return;
    btn.dataset.boundStart = '1';

    btn.addEventListener('click', triggerStart, { passive: false });
    btn.addEventListener('pointerup', triggerStart, { passive: false });
    btn.addEventListener('touchend', triggerStart, { passive: false });

    document.addEventListener('pointerdown', onAnyStartHit, { capture: true });
    document.addEventListener('touchstart', onAnyStartHit, { capture: true, passive: false });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();
