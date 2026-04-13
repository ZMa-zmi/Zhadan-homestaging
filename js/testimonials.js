document.addEventListener('DOMContentLoaded', () => {
  const track   = document.getElementById('tpc-track');
  const slides  = track ? Array.from(track.querySelectorAll('.tpc__slide')) : [];
  const dots    = Array.from(document.querySelectorAll('.tpc__dot'));
  const btnPrev = document.getElementById('tpc-prev');
  const btnNext = document.getElementById('tpc-next');

  if (!track || slides.length === 0) return;

  let current = 0;

  function goTo(index) {
    slides[current].classList.remove('is-active');
    dots[current].classList.remove('active');
    dots[current].setAttribute('aria-selected', 'false');

    current = (index + slides.length) % slides.length;

    slides[current].classList.add('is-active');
    dots[current].classList.add('active');
    dots[current].setAttribute('aria-selected', 'true');
  }

  if (btnPrev) btnPrev.addEventListener('click', () => goTo(current - 1));
  if (btnNext) btnNext.addEventListener('click', () => goTo(current + 1));

  dots.forEach((dot) => {
    dot.addEventListener('click', () => goTo(Number(dot.dataset.goto)));
  });

  // Touch / swipe
  let startX = null;
  track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', (e) => {
    if (startX === null) return;
    const delta = e.changedTouches[0].clientX - startX;
    if (Math.abs(delta) > 40) goTo(delta < 0 ? current + 1 : current - 1);
    startX = null;
  }, { passive: true });

  // Auto-advance every 6 s, pauses on hover
  const container = document.getElementById('testimonials');
  let timer = setInterval(() => goTo(current + 1), 6000);
  if (container) {
    container.addEventListener('mouseenter', () => clearInterval(timer));
    container.addEventListener('mouseleave', () => {
      timer = setInterval(() => goTo(current + 1), 6000);
    });
  }
});
