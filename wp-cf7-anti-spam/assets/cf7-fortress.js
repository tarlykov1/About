(function () {
  const fieldName = '_cf7_fts';

  function setTimestamp(form) {
    const field = form.querySelector(`input[name="${fieldName}"]`);
    if (!field) return;

    field.value = Math.floor(Date.now() / 1000).toString();
  }

  function boot() {
    document
      .querySelectorAll('.wpcf7 form')
      .forEach((form) => setTimestamp(form));
  }

  document.addEventListener('wpcf7init', (event) => {
    const form = event?.target?.querySelector?.('form');
    if (form) setTimestamp(form);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
