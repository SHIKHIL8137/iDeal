//form validation

function validateForm(event) {
  event.preventDefault(); 


  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const companyName = document.getElementById('companyName').value.trim();
  const address = document.getElementById('address').value.trim();
  const country = document.getElementById('country').value.trim();
  const state = document.getElementById('state').value.trim();
  const city = document.getElementById('city').value.trim();
  const zipCode = document.getElementById('zipCode').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();

  let isValid = true;


  document.querySelectorAll('.error').forEach(error => error.remove());


  if (firstName === '') {
    displayError('firstName', 'First name is required');
    isValid = false;
  }
  if (lastName === '') {
    displayError('lastName', 'Last name is required');
    isValid = false;
  }


  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (email === '' || !emailRegex.test(email)) {
    displayError('email', 'Please enter a valid email');
    isValid = false;
  }


  const phoneRegex = /^\d{10}$/;
  if (phone === '' || !phoneRegex.test(phone)) {
    displayError('phone', 'Please enter a valid phone number (10 digits)');
    isValid = false;
  }


  const zipCodeRegex = /^\d{6}$/;
  if (zipCode === '' || !zipCodeRegex.test(zipCode)) {
    displayError('zipCode', 'Please enter a valid zip code');
    isValid = false;
  }

  if (address === '') {
    displayError('address', 'Address is required');
    isValid = false;
  }
  if (state === '') {
    displayError('state', 'State is required');
    isValid = false;
  }
  if (city === '') {
    displayError('city', 'City is required');
    isValid = false;
  }
  if (country === 'Select...') {
    displayError('country', 'Please select a country');
    isValid = false;
  }

  if (isValid) {
    document.querySelector('form').submit();
  }
}

// Function to display error message
function displayError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const error = document.createElement('div');
  error.classList.add('error');
  error.style.color = 'red';
  error.textContent = message;
  field.parentElement.appendChild(error);
}

// Add event listener to form submission
document.querySelector('form').addEventListener('submit', validateForm);


// for alert box
const alertBox = document.getElementById("alertBox");
  alertBox.classList.add("show");
  setTimeout(() => {
    alertBox.classList.remove("show");
    alertBox.classList.add("hide");
    setTimeout(() => {
      alertBox.style.display = "none";
    }, 500); 
  }, 3000); 




// remove the params from the url
if (window.location.search) {
  const url = window.location.origin + window.location.pathname;
  window.history.replaceState({}, document.title, url);
}