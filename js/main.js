document.addEventListener('DOMContentLoaded', () => {
  /* ===== Header scroll shadow ===== */
  const header = document.getElementById('header');

  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('header--scrolled', window.scrollY > 50);
    }, { passive: true });
  }

  /* ===== Mobile burger menu ===== */
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');

  if (burger && nav) {
    burger.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('header__nav--open');
      burger.setAttribute('aria-expanded', isOpen);
      document.body.classList.toggle('no-scroll', isOpen);
    });

    // Close menu on nav link click
    nav.addEventListener('click', (e) => {
      if (e.target.matches('.header__nav-link')) {
        nav.classList.remove('header__nav--open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('no-scroll');
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('header__nav--open')) {
        nav.classList.remove('header__nav--open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('no-scroll');
        burger.focus();
      }
    });
  }

  /* ===== Active nav link highlighting ===== */
  const sections = document.querySelectorAll('main .section[id]');
  const navLinks = document.querySelectorAll('.header__nav-link');

  if (sections.length && navLinks.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach((link) => {
            link.classList.toggle(
              'header__nav-link--active',
              link.getAttribute('href') === '#' + id
            );
          });
        }
      });
    }, { rootMargin: '-40% 0px -60% 0px' });

    sections.forEach((section) => observer.observe(section));
  }
});
