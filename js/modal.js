document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('modal-pricing');
  if (!modal) return;

  const modalText = document.getElementById('modal-text');
  const backdrop = modal.querySelector('.modal__backdrop');
  const closeBtn = modal.querySelector('.modal__close');
  const closeBtnBottom = modal.querySelector('.modal__close-btn');

  function openModal(desc) {
    if (modalText && desc) {
      modalText.textContent = desc;
    }
    modal.hidden = false;
    document.body.classList.add('no-scroll');

    // Focus trap: focus the close button
    setTimeout(() => closeBtn.focus(), 100);
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove('no-scroll');
  }

  // Open on pricing CTA click
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-modal="pricing"]');
    if (!btn) return;

    e.preventDefault();
    openModal(btn.dataset.desc);
  });

  // Close handlers
  closeBtn.addEventListener('click', closeModal);
  closeBtnBottom.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) {
      closeModal();
    }
  });
});
