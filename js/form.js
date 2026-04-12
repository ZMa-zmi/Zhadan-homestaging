document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const phoneInput = form.querySelector('#phone');
  const nameInput = form.querySelector('#name');

  /* ===== Phone mask ===== */
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');

      // Normalize: 8 -> 7
      if (val.length > 0 && val[0] === '8') {
        val = '7' + val.slice(1);
      }

      // Don't start with anything but 7
      if (val.length > 0 && val[0] !== '7') {
        val = '7' + val;
      }

      let formatted = '';
      if (val.length > 0) formatted = '+' + val[0];
      if (val.length > 1) formatted += ' (' + val.slice(1, 4);
      if (val.length >= 4) formatted += ') ';
      if (val.length > 4) formatted += val.slice(4, 7);
      if (val.length > 7) formatted += '-' + val.slice(7, 9);
      if (val.length > 9) formatted += '-' + val.slice(9, 11);

      e.target.value = formatted;
    });

    // Prevent non-numeric input
    phoneInput.addEventListener('keydown', (e) => {
      if (
        e.key.length === 1 &&
        !/[\d+\-() ]/.test(e.key) &&
        !e.ctrlKey && !e.metaKey
      ) {
        e.preventDefault();
      }
    });
  }

  /* ===== Validation ===== */
  function showError(input, message) {
    input.classList.add('form-input--error');
    const error = input.parentElement.querySelector('.form-error');
    if (error) error.textContent = message;
  }

  function clearError(input) {
    input.classList.remove('form-input--error');
    const error = input.parentElement.querySelector('.form-error');
    if (error) error.textContent = '';
  }

  function validateForm() {
    let valid = true;

    // Name
    if (nameInput) {
      const name = nameInput.value.trim();
      if (!name) {
        showError(nameInput, 'Введите ваше имя');
        valid = false;
      } else if (name.length < 2) {
        showError(nameInput, 'Имя должно быть не менее 2 символов');
        valid = false;
      } else {
        clearError(nameInput);
      }
    }

    // Phone
    if (phoneInput) {
      const digits = phoneInput.value.replace(/\D/g, '');
      if (!digits) {
        showError(phoneInput, 'Введите номер телефона');
        valid = false;
      } else if (digits.length < 11) {
        showError(phoneInput, 'Введите полный номер телефона');
        valid = false;
      } else {
        clearError(phoneInput);
      }
    }

    return valid;
  }

  // Clear errors on input
  [nameInput, phoneInput].forEach((input) => {
    if (input) {
      input.addEventListener('input', () => clearError(input));
    }
  });

  /* ===== Submit ===== */
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Show success (no backend)
    const submitBtn = form.querySelector('.contacts__submit');
    if (submitBtn) {
      submitBtn.textContent = 'Отправлено!';
      submitBtn.disabled = true;
      submitBtn.style.backgroundColor = 'var(--color-accent)';
    }

    setTimeout(() => {
      form.innerHTML =
        '<p class="form-success">Спасибо! Мы свяжемся с вами в ближайшее время.</p>';
    }, 800);
  });
});
