document.addEventListener('DOMContentLoaded', () => {
  const filterContainer = document.querySelector('.portfolio__filters');
  const grid = document.querySelector('.portfolio__grid');

  if (!filterContainer || !grid) return;

  const items = grid.querySelectorAll('.portfolio__item');

  filterContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.portfolio__filter-btn');
    if (!btn) return;

    // Update active state
    filterContainer.querySelector('.active')?.classList.remove('active');
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    items.forEach((item) => {
      const match = filter === 'all' || item.dataset.category === filter;

      if (match) {
        item.classList.remove('portfolio__item--hidden');
      } else {
        item.classList.add('portfolio__item--hidden');
      }
    });
  });
});
