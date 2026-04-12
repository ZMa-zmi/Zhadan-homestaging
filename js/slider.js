document.addEventListener('DOMContentLoaded', () => {
  const containers = document.querySelectorAll('.slider__container');

  containers.forEach((container) => {
    const range = container.querySelector('.slider__range');
    const wrapper = container.querySelector('.slider__img-wrapper');
    const handle = container.querySelector('.slider__handle');

    if (!range || !wrapper || !handle) return;

    const update = () => {
      const val = range.value + '%';
      wrapper.style.width = val;
      handle.style.left = val;
    };

    range.addEventListener('input', update);

    // Set initial position
    update();
  });
});
