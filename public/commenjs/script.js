const validationRules = {
  required: value => value.trim() !== '' || 'This field is required.',
  min: (value, param) => value.length >= param || `Minimum ${param} characters required.`,
  email: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Invalid email address.',
  uppercase: value => /[A-Z]/.test(value) || 'Must contain at least one uppercase letter.',
  number: value => /\d/.test(value) || 'Must contain at least one number.',
  match: (value, fieldId) => {
      const targetField = document.getElementById(fieldId);
      return value === targetField.value || 'Password does not match.';
  },
};

const handleValidation = (input) => {
  const rules = input.dataset.validate.split('|');
  const errorSpan = input.nextElementSibling;
  const value = input.value.trim();

  for (const rule of rules) {
      const [ruleName, param] = rule.split(':');
      const validation = validationRules[ruleName](value, param);
      if (validation !== true) {
          input.style.borderColor = "var(--red)";
          if (errorSpan) {
              errorSpan.textContent = validation;
          }
          return false;
      }
  }
  input.style.borderColor = 'var(--light-grey)';
  errorSpan.textContent = '';
  return true;
};

Array.from(form.elements).forEach(input => {
  if (input.type !== 'submit') {
      if (input.className == "otp-box") {
          input.addEventListener("keyup", (event) => {
              if (event.keyCode === 13 || input.value.length == 1) {
                  if (input.nextElementSibling &&  input.nextElementSibling.type === "text") {
                      input.nextElementSibling.focus()
                  }
              }
            });
      } else {
          input.addEventListener('input', () => handleValidation(input));
      }
      
  }
});


form.addEventListener('submit', (event) => {
  event.preventDefault();
  let isValid = true;

  Array.from(form.elements).forEach(input => {
  if (input.type !== 'submit') {
      if (!handleValidation(input)) {
          isValid = false;
      }
      }
  });

  if (isValid) {
      form.submit();
      form.reset();
    }
});