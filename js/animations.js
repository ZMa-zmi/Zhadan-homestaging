document.addEventListener('DOMContentLoaded', () => {

  /* ============================================================
     WORDMARK SCROLL ANIMATION — Tilesuite pattern

     The wordmark starts as position:fixed (CSS).
     JS drives its vertical exit by applying translateY
     when the hero section scrolls off-screen.

     Logic:
     - heroRect.bottom > 0  → hero still visible → no offset
     - heroRect.bottom → 0  → hero bottom leaving viewport
       → push wordmark up proportionally
     - heroRect.bottom ≤ 0  → hero fully gone → wordmark hidden
     ============================================================ */

  const wordmark = document.getElementById('wordmark');
  const hero     = document.querySelector('.hero');
  const mainEl   = document.querySelector('main');

  if (!wordmark || !hero) return;

  let rafId = null;
  let scrollEnabled = false;

  // Enable after entrance animation completes (0.1s delay + 1.1s duration + buffer)
  setTimeout(() => {
    scrollEnabled = true;
    update();
  }, 1300);

  const update = () => {
    if (!scrollEnabled) return;

    const heroBot = hero.getBoundingClientRect().bottom;
    const vh      = window.innerHeight;
    const wmH     = wordmark.offsetHeight;

    if (heroBot <= 0) {
      // Hero fully scrolled past — push wordmark completely off-screen upward
      wordmark.style.transform = `translateY(-${wmH + 30}px)`;
    } else if (heroBot >= vh) {
      // Hero bottom still below viewport bottom — wordmark in normal position
      wordmark.style.transform = 'translateY(0)';
    } else {
      // Hero bottom crossing the bottom of the viewport (heroBot: vh → 0)
      // progress: 0 = hero bottom at screen bottom, 1 = hero bottom at screen top
      const progress = 1 - (heroBot / vh);
      const offset   = progress * (wmH + 30);
      wordmark.style.transform = `translateY(-${offset}px)`;
    }

    rafId = null;
  };

  window.addEventListener('scroll', () => {
    if (!rafId) rafId = requestAnimationFrame(update);
  }, { passive: true });

  window.addEventListener('resize', () => {
    if (!rafId) rafId = requestAnimationFrame(update);
  }, { passive: true });

  /* ============================================================
     REVEAL ON SCROLL
     ============================================================ */
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReducedMotion) {
    reveals.forEach((el) => el.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  reveals.forEach((el) => observer.observe(el));
});
