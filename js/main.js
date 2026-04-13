document.addEventListener('DOMContentLoaded', () => {
  /* ===== Header: transparent over hero, fixed+opaque after scroll ===== */
  const header = document.getElementById('header');
  const heroWrapper = document.getElementById('hero');

  if (header && heroWrapper) {
    const heroBottom = () => heroWrapper.offsetTop + heroWrapper.offsetHeight;

    const onScroll = () => {
      const past = window.scrollY + header.offsetHeight > heroBottom() - 80;
      header.classList.toggle('header--fixed', past);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // init
  }

  /* ===== Mobile burger menu ===== */
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');

  if (burger && nav) {
    // Inject CTA link into mobile nav (once)
    if (!nav.querySelector('.header__nav-cta')) {
      const ctaLink = document.createElement('a');
      ctaLink.href = '#contacts';
      ctaLink.className = 'header__nav-cta';
      ctaLink.textContent = 'Оставить заявку';
      nav.appendChild(ctaLink);
    }

    // Remember original parent to restore nav on close
    const navOriginalParent = nav.parentElement;
    const navNextSibling = nav.nextElementSibling;

    const openMenu = () => {
      // Move nav to <body> to escape any stacking context created by header
      document.body.appendChild(nav);
      nav.classList.add('is-open');
      burger.setAttribute('aria-expanded', 'true');
      document.body.classList.add('no-scroll');
    };

    const closeMenu = () => {
      nav.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('no-scroll');
      // Return nav to its original place in the header
      if (navNextSibling) {
        navOriginalParent.insertBefore(nav, navNextSibling);
      } else {
        navOriginalParent.appendChild(nav);
      }
    };

    burger.addEventListener('click', () => {
      if (nav.classList.contains('is-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    nav.addEventListener('click', (e) => {
      if (e.target.matches('.header__nav-link') || e.target.matches('.header__nav-cta')) {
        closeMenu();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        closeMenu();
        burger.focus();
      }
    });
  }

  /* ===== Advantage cards: 3D skew / tilt on mouse move ===== */
  (function initCardTilt() {
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer) return;

    const cards = document.querySelectorAll('.advantage-card');
    if (!cards.length) return;

    const MAX_TILT = 12; // degrees
    const PERSPECTIVE = 800; // px

    cards.forEach((card) => {
      // Wrap card in a perspective container without touching the DOM structure
      card.style.perspective = PERSPECTIVE + 'px';

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        // Normalised mouse position within card: -0.5 .. +0.5
        const nx = (e.clientX - rect.left) / rect.width - 0.5;
        const ny = (e.clientY - rect.top) / rect.height - 0.5;

        const rotX = -ny * MAX_TILT; // tilt up/down (inverted)
        const rotY =  nx * MAX_TILT; // tilt left/right

        card.style.transition = 'box-shadow 0.1s ease';
        card.style.transform = `perspective(${PERSPECTIVE}px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.03, 1.03, 1.03)`;

        // Drive glare position via CSS custom props (percentage from top-left)
        const pctX = ((e.clientX - rect.left) / rect.width) * 100;
        const pctY = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mx', pctX + '%');
        card.style.setProperty('--my', pctY + '%');

        card.classList.add('is-tilting');
      });

      card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.4s ease';
        card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        card.classList.remove('is-tilting');
      });

      card.addEventListener('mouseenter', () => {
        card.style.transition = 'box-shadow 0.1s ease';
      });
    });
  })();

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
