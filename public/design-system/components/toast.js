/**
 * Toast notification system
 *
 * Usage:
 *   Toast.show({ title: 'Saved!', message: 'Your changes were saved.', type: 'success' })
 *   Toast.show({ title: 'Error', type: 'error', duration: 0 })  // duration 0 = persistent
 *   Toast.dismiss(id)
 */

const Toast = (() => {
  const ICONS = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
  let _region = null;
  let _counter = 0;

  function _getRegion() {
    if (!_region) {
      _region = document.querySelector('.toast-region');
      if (!_region) {
        _region = document.createElement('div');
        _region.className = 'toast-region';
        _region.setAttribute('role', 'region');
        _region.setAttribute('aria-label', 'Notifications');
        _region.setAttribute('aria-live', 'polite');
        document.body.appendChild(_region);
      }
    }
    return _region;
  }

  function show({ title = '', message = '', type = 'info', duration = 4000 } = {}) {
    const region = _getRegion();
    const id = `toast-${++_counter}`;
    const icon = ICONS[type] || ICONS.info;

    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.id = id;
    el.setAttribute('role', 'alert');
    el.innerHTML = `
      <span class="toast-icon" aria-hidden="true">${icon}</span>
      <div class="toast-content">
        ${title ? `<p class="toast-title">${title}</p>` : ''}
        ${message ? `<p class="toast-message">${message}</p>` : ''}
      </div>
      <button class="toast-dismiss" aria-label="Dismiss notification" onclick="Toast.dismiss('${id}')">✕</button>
      ${duration > 0 ? `<div class="toast-progress" style="animation-duration: ${duration}ms;"></div>` : ''}
    `;

    region.appendChild(el);

    if (duration > 0) {
      setTimeout(() => dismiss(id), duration);
    }

    return id;
  }

  function dismiss(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('is-leaving');
    el.addEventListener('animationend', () => el.remove(), { once: true });
    // Fallback removal
    setTimeout(() => el.remove(), 400);
  }

  function success(title, message, opts = {}) { return show({ title, message, type: 'success', ...opts }); }
  function error(title, message, opts = {})   { return show({ title, message, type: 'error',   ...opts }); }
  function warning(title, message, opts = {}) { return show({ title, message, type: 'warning', ...opts }); }
  function info(title, message, opts = {})    { return show({ title, message, type: 'info',    ...opts }); }

  return { show, dismiss, success, error, warning, info };
})();

window.Toast = Toast;
