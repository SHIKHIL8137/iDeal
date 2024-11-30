document.querySelectorAll('.btn-outline-light').forEach(button => {
  button.addEventListener('click', function () {
    const input = this.parentNode.querySelector('input');
    let currentValue = parseInt(input.value) || 0;

    if (this.textContent.trim() === '+') {
      if (currentValue < 10) {
        input.value = currentValue + 1;
      }
    } else if (this.textContent.trim() === '-' && currentValue > 0) {
      input.value = currentValue - 1;
    }
  });
});

