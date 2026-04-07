/**
 * Code block — copy button & nav hamburger auto-init
 */

document.addEventListener('DOMContentLoaded', () => {

  // ─── Copy buttons ──────────────────────────────────────────────────────────
  document.querySelectorAll('.code-block-copy').forEach(btn => {
    btn.addEventListener('click', async () => {
      const block = btn.closest('.code-block');
      const pre   = block?.querySelector('pre');
      if (!pre) return;

      try {
        await navigator.clipboard.writeText(pre.innerText);
        btn.classList.add('copied');
        const prevText = btn.innerHTML;
        btn.innerHTML = '✓ Copied';
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.innerHTML = prevText;
        }, 2000);
      } catch {
        btn.textContent = 'Failed';
        setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
      }
    });
  });

  // ─── Nav hamburger ─────────────────────────────────────────────────────────
  const hamburgers = document.querySelectorAll('.nav-hamburger');
  hamburgers.forEach(btn => {
    btn.addEventListener('click', () => {
      const nav = btn.closest('.nav');
      const links = nav?.querySelector('.nav-links');
      if (!links) return;
      const isOpen = links.classList.toggle('is-open');
      btn.classList.toggle('is-open', isOpen);
      btn.setAttribute('aria-expanded', isOpen);
    });
  });

  // Close mobile nav on link click
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      document.querySelectorAll('.nav-links.is-open').forEach(links => {
        links.classList.remove('is-open');
        links.closest('.nav')?.querySelector('.nav-hamburger')?.classList.remove('is-open');
      });
    });
  });

  // ─── Textarea character counter ────────────────────────────────────────────
  document.querySelectorAll('textarea[maxlength]').forEach(ta => {
    const counter = ta.parentElement?.querySelector('.textarea-counter');
    if (!counter) return;
    const max = parseInt(ta.getAttribute('maxlength'));
    function update() {
      counter.textContent = `${ta.value.length} / ${max}`;
    }
    ta.addEventListener('input', update);
    update();
  });

});
