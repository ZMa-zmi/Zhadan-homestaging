/* ===== ProfileCard: experience bar + counters + follow toggle ===== */
(function () {
  function initProfileCard() {
    const card = document.getElementById('profile-card');
    if (!card) return;

    /* --- Follow button toggle --- */
    const followBtn = document.getElementById('profile-follow-btn');
    const followText = followBtn && followBtn.querySelector('.profile-card__follow-text');
    const followIcon = followBtn && followBtn.querySelector('.profile-card__follow-icon');

    if (followBtn) {
      followBtn.addEventListener('click', () => {
        const active = followBtn.classList.toggle('is-active');
        if (followText) followText.textContent = active ? 'Написали' : 'Написать';
        if (followIcon) followIcon.textContent = active ? '✓' : '+';
      });
    }

    /* --- Intersection Observer: trigger animations on scroll into view --- */
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        startAnimations();
      });
    }, { threshold: 0.35 });

    observer.observe(card);
  }

  function startAnimations() {
    /* Experience bar */
    const expFill = document.getElementById('profile-exp-fill');
    if (expFill) {
      setTimeout(() => {
        expFill.style.width = '72%';
      }, 300);
    }

    /* Stat counters */
    const statEls = document.querySelectorAll('.profile-card__stat-value[data-target]');
    statEls.forEach((el) => {
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      const duration = 1800;
      const steps = 60;
      const stepDuration = duration / steps;
      const increment = target / steps;
      let current = 0;
      let step = 0;

      setTimeout(() => {
        const interval = setInterval(() => {
          step++;
          current = Math.min(Math.floor(increment * step), target);
          el.textContent = current + suffix;
          if (step >= steps) clearInterval(interval);
        }, stepDuration);
      }, 500);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProfileCard);
  } else {
    initProfileCard();
  }
})();
