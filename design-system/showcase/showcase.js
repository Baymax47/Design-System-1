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
    const label = el?.querySelector('.ds-swatch-label');
    if (label) {
      const prev = label.textContent;
      label.textContent = '✓';
      setTimeout(() => { label.textContent = prev; }, 1200);
    }
    Toast.success('Copied!', text, { duration: 1800 });
  } catch {
    Toast.error('Copy failed', 'Please copy manually.');
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

/* ─── Active sidebar nav link on scroll ───────────────────────────────────── */
function initScrollSpy() {
  const sections = document.querySelectorAll('.ds-section[id]');
  const links    = document.querySelectorAll('.sidenav-link[data-section], .nav-link[data-section]');
  if (!sections.length || !links.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        links.forEach(l => l.classList.toggle('active', l.dataset.section === id));
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });

  sections.forEach(s => observer.observe(s));
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

  hamburger?.addEventListener('click', () => {
    const open = links.classList.toggle('is-open');
    hamburger.classList.toggle('is-open', open);
    hamburger.setAttribute('aria-expanded', open);
  });
}

/* ─── Boot ────────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  renderSwatches('brand-swatches', brandColors);
  renderSwatches('gray-swatches',  grayColors);
  renderSpacing();
  initTheme();
  initScrollSpy();
  initFigmaExport();
  initMobileNav();
});
