document.addEventListener('DOMContentLoaded', function () {
  const searchEmail = document.getElementById('email');
  const message = document.getElementById('message');
  let debounceTimeout = null;

  searchEmail.addEventListener('input', function () {
    const query = searchEmail.value.trim();
    console.log('clicked');

    clearTimeout(debounceTimeout);

    debounceTimeout = setTimeout(function () {
      if (query.length > 0) {
        if (isValidEmail(query)) {
          fetchEmail(query); 
        } else {
          message.innerHTML = 'Invalid email format';
          timerStart();
        }
      } else {
        message.innerHTML = ''; 
      }
    }, 100); 
  });

  async function fetchEmail(query) {
    try {
      const response = await fetch(`/user/check-email?email=${encodeURIComponent(query)}`);
      const result = await response.json();

      if (result.exists) {
        message.innerHTML = 'Email exists';
        timerStart();
      } 
    } catch (error) {
      console.error(error);
      message.innerHTML = 'An error occurred. Please try again.';
      timerStart();
    }
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function timerStart() {
    setTimeout(() => {
      message.innerHTML = '';
    }, 5000); 
  }
});
