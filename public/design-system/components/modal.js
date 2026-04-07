/**
 * Modal controller
 * Usage:
 *   Modal.open('myModal')
 *   Modal.close('myModal')
 *   Modal.toggle('myModal')
 *
 * HTML: <div class="modal-overlay" id="myModal">
 *         <div class="modal" role="dialog" aria-modal="true" aria-labelledby="myModal-title">
 *           ...
 *         </div>
 *       </div>
 */

const Modal = (() => {
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  let _previousFocus = null;

  function open(idOrEl) {
    const overlay = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
    if (!overlay) return;

    _previousFocus = document.activeElement;
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus first focusable element
    requestAnimationFrame(() => {
      const first = overlay.querySelector(FOCUSABLE);
      if (first) first.focus();
    });

    // Trap focus inside modal
    overlay._trapFn = (e) => _trapFocus(e, overlay);
    overlay.addEventListener('keydown', overlay._trapFn);

    // Close on Escape
    overlay._escapeFn = (e) => { if (e.key === 'Escape') close(overlay); };
    document.addEventListener('keydown', overlay._escapeFn);

    // Close on backdrop click
    overlay._backdropFn = (e) => { if (e.target === overlay) close(overlay); };
    overlay.addEventListener('click', overlay._backdropFn);
  }

  function close(idOrEl) {
    const overlay = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
    if (!overlay) return;

    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    // Restore focus
    if (_previousFocus) { _previousFocus.focus(); _previousFocus = null; }

    // Remove listeners
    overlay.removeEventListener('keydown', overlay._trapFn);
    document.removeEventListener('keydown', overlay._escapeFn);
    overlay.removeEventListener('click', overlay._backdropFn);
  }

  function toggle(idOrEl) {
    const overlay = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
    if (!overlay) return;
    overlay.classList.contains('is-open') ? close(overlay) : open(overlay);
  }

  function _trapFocus(e, container) {
    if (e.key !== 'Tab') return;
    const focusable = [...container.querySelectorAll(FOCUSABLE)];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  // Auto-wire [data-modal-open], [data-modal-close], [data-modal-toggle]
  document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', (e) => {
      const opener  = e.target.closest('[data-modal-open]');
      const closer  = e.target.closest('[data-modal-close]');
      const toggler = e.target.closest('[data-modal-toggle]');
      if (opener)  open(opener.dataset.modalOpen);
      if (closer)  close(closer.dataset.modalClose || closer.closest('.modal-overlay'));
      if (toggler) toggle(toggler.dataset.modalToggle);
    });
  });

  return { open, close, toggle };
})();

// Make globally available
window.Modal = Modal;
