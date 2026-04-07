/* ─── Brand palette swatches ─────────────────────────────────────────────── */
const brandColors = [
  { stop: '50',  hex: '#f0eeff' }, { stop: '100', hex: '#e2dcff' },
  { stop: '200', hex: '#c8beff' }, { stop: '300', hex: '#a99af9' },
  { stop: '400', hex: '#8f7ef8' }, { stop: '500', hex: '#7c6ef7' },
  { stop: '600', hex: '#6255d4' }, { stop: '700', hex: '#4a3fb0' },
  { stop: '800', hex: '#342c8c' }, { stop: '900', hex: '#201b68' },
  { stop: '950', hex: '#120f44' },
];

const grayColors = [
  { stop: '50',  hex: '#f8f8fc' }, { stop: '100', hex: '#f0f0f7' },
  { stop: '200', hex: '#dcdcec' }, { stop: '300', hex: '#c2c2d6' },
  { stop: '400', hex: '#9090aa' }, { stop: '500', hex: '#6b6b80' },
  { stop: '600', hex: '#4f4f62' }, { stop: '700', hex: '#3a3a4a' },
  { stop: '800', hex: '#1e1e30' }, { stop: '850', hex: '#15151f' },
  { stop: '900', hex: '#10101a' }, { stop: '950', hex: '#080810' },
];

const spacingTokens = [
  { name: 'spacing-1',  px: 4   }, { name: 'spacing-2',  px: 8   },
  { name: 'spacing-3',  px: 12  }, { name: 'spacing-4',  px: 16  },
  { name: 'spacing-5',  px: 20  }, { name: 'spacing-6',  px: 24  },
  { name: 'spacing-8',  px: 32  }, { name: 'spacing-10', px: 40  },
  { name: 'spacing-12', px: 48  }, { name: 'spacing-16', px: 64  },
  { name: 'spacing-20', px: 80  }, { name: 'spacing-24', px: 96  },
  { name: 'spacing-32', px: 128 },
];

/* ─── Render swatches ─────────────────────────────────────────────────────── */
function renderSwatches(containerId, colors) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = colors.map(c => `
    <div class="ds-swatch" title="Click to copy ${c.hex}" onclick="copyText('${c.hex}', this)">
      <div class="ds-swatch-box" style="background:${c.hex}"></div>
      <span class="ds-swatch-label">${c.stop}</span>
    </div>
  `).join('');
}

function renderSpacing() {
  const el = document.getElementById('spacing-ruler');
  if (!el) return;
  const max = 128;
  el.innerHTML = spacingTokens.map(t => `
    <div class="ds-spacing-item">
      <span class="ds-spacing-bar-label">--ds-${t.name}</span>
      <div class="ds-spacing-bar" style="width:${(t.px / max) * 100}%;min-width:${t.px}px"></div>
      <span class="ds-spacing-px">${t.px}px</span>
    </div>
  `).join('');
}

/* ─── Copy helper ─────────────────────────────────────────────────────────── */
async function copyText(text, el) {
  try {
    await navigator.clipboard.writeText(text);
    const label = el?.querySelector('.ds-swatch-label, code');
    if (label) {
      const prev = label.textContent;
      label.textContent = 'Copied!';
      setTimeout(() => { label.textContent = prev; }, 1200);
    }
    window.Toast?.success('Copied!', text, { duration: 1800 });
  } catch {
    window.Toast?.error('Copy failed', 'Please copy manually.');
  }
}
window.copyText = copyText;

/* ─── Theme switcher ──────────────────────────────────────────────────────── */
function initTheme() {
  const btn = document.getElementById('theme-toggle');
  const html = document.documentElement;
  const saved = localStorage.getItem('ds-theme') || 'dark';
  applyTheme(saved);

  btn?.addEventListener('click', () => {
    const next = html.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('ds-theme', next);
  });
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = theme === 'dark' ? '🌙' : '☀️';
}

/* ─── SPA Hash Router ─────────────────────────────────────────────────────── */
function initRouter() {
  const pages = document.querySelectorAll('.ds-page[id]');
  const links = document.querySelectorAll('.sidenav-link[data-section], .nav-link[data-section]');
  
  function route() {
    let hash = window.location.hash.substring(1) || 'tokens';
    const targetId = 'page-' + hash;
    
    // Fallback if target doesn't exist
    if (!document.getElementById(targetId)) {
      hash = 'tokens';
    }
    
    // Update active nav link
    links.forEach(l => l.classList.toggle('active', l.dataset.section === hash));
    
    // Show active page, hide others
    pages.forEach(p => {
      const isActive = p.id === 'page-' + hash;
      p.classList.toggle('is-active', isActive);
    });
    
    window.scrollTo(0, 0);
  }

  // Handle link clicks to update hash cleanly
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const section = link.dataset.section;
      history.pushState(null, null, '#' + section);
      route();
    });
  });

  window.addEventListener('hashchange', route);
  route(); // Init on load
}

/* ─── Figma export button ────────────────────────────────────────────────── */
function initFigmaExport() {
  const btn = document.getElementById('figma-export-btn');
  const runBtn = document.getElementById('figma-run-btn');

  btn?.addEventListener('click', () => Modal.open('figma-modal'));

  runBtn?.addEventListener('click', async () => {
    runBtn.disabled = true;
    runBtn.innerHTML = '<span style="display:inline-block;width:12px;height:12px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:btn-spin 0.6s linear infinite;margin-right:6px"></span> Exporting…';

    try {
      const res = await fetch('/api/dev/figma-export', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        Toast.success('Exported!', `${data.variablesCount || ''} variables pushed to Figma.`);
        Modal.close('figma-modal');
      } else {
        Toast.error('Export failed', data.error || 'Check your .env credentials.');
      }
    } catch {
      Toast.info('Manual export', 'Run `npm run ds:figma` in your terminal.');
      Modal.close('figma-modal');
    }

    runBtn.disabled = false;
    runBtn.innerHTML = 'Run Export';
  });
}

/* ─── Mobile nav hamburger ───────────────────────────────────────────────── */
function initMobileNav() {
  const hamburger = document.getElementById('nav-hamburger');
  const links     = document.getElementById('nav-links');
  const nav       = document.getElementById('top-nav');
  if (!hamburger || !links) return;

  // Create overlay backdrop
  let overlay = document.querySelector('.nav-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);
  }

  function openDrawer() {
    links.classList.add('is-open');
    hamburger.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    overlay.classList.add('is-visible');
    document.body.style.overflow = 'hidden'; // Prevent background scroll
  }

  function closeDrawer() {
    links.classList.remove('is-open');
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    overlay.classList.remove('is-visible');
    document.body.style.overflow = '';
  }

  function toggleDrawer(e) {
    e.preventDefault();
    e.stopPropagation();
    if (links.classList.contains('is-open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  }

  // Use both click and touchend for maximum compatibility
  hamburger.addEventListener('click', toggleDrawer);
  hamburger.addEventListener('touchend', (e) => {
    e.preventDefault();
    toggleDrawer(e);
  }, { passive: false });

  // Close on overlay click
  overlay.addEventListener('click', closeDrawer);

  // Close when a nav link is clicked
  links.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && links.classList.contains('is-open')) {
      closeDrawer();
    }
  });
}

/* ─── Boot ────────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  renderSwatches('brand-swatches', brandColors);
  renderSwatches('gray-swatches',  grayColors);
  renderSpacing();
  initTheme();
  initRouter();
  initFigmaExport();
  initMobileNav();
});
