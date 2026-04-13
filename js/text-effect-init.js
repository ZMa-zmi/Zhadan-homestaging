/**
 * text-effect-init.js
 *
 * Scans the DOM for [data-text-effect] elements and initialises
 * the TextEffect class on each one.
 *
 * Data attributes:
 *   data-text-effect                 — marks the element (required)
 *   data-text-effect-preset          — 'blur' | 'shake' | 'scale' | 'fade' | 'slide'  (default: 'fade')
 *   data-text-effect-per             — 'word' | 'char' | 'line'  (default: 'word')
 *   data-text-effect-delay           — number in seconds before stagger starts (default: 0)
 *   data-text-effect-stagger         — override stagger per segment in seconds
 *   data-text-effect-scroll          — if present, plays when element enters viewport
 *                                      instead of immediately on load
 *   data-text-effect-exit-on-scroll  — if present on a scroll element, also exits when leaving
 */

document.addEventListener('DOMContentLoaded', () => {

  /* Respect reduced motion globally */
  const prefersReducedMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const elements = document.querySelectorAll('[data-text-effect]');
  if (!elements.length) return;

  const effects = [];

  elements.forEach((el) => {
    const preset   = el.dataset.textEffectPreset  || 'fade';
    const per      = el.dataset.textEffectPer     || 'word';
    const delay    = parseFloat(el.dataset.textEffectDelay  || '0');
    const stagger  = el.dataset.textEffectStagger
      ? parseFloat(el.dataset.textEffectStagger)
      : undefined;

    const isScroll = el.hasAttribute('data-text-effect-scroll');
    const exitOnScroll = el.hasAttribute('data-text-effect-exit-on-scroll');

    // Store per-attribute on el for CSS hooks
    el.dataset.textEffectPer = per;

    /* If reduced motion, just show text immediately */
    if (prefersReducedMotion) {
      return; // CSS @media rule handles the visual reveal
    }

    const effect = new TextEffect(el, {
      preset,
      per,
      delay,
      stagger,
      trigger: !isScroll, // play immediately if NOT scroll-triggered
    });

    if (isScroll) {
      /* Use IntersectionObserver to trigger on scroll */
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              effect.play();
              if (!exitOnScroll) {
                // One-shot: stop observing once played
                observer.unobserve(el);
              }
            } else if (exitOnScroll) {
              effect.exit();
            }
          });
        },
        { threshold: 0.2 }
      );

      observer.observe(el);
    }

    effects.push({ el, effect });
  });

});
