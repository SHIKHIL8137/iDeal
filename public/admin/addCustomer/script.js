// Function to validate the form
function validateForm() {
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const password = document.getElementById('password').value;
  const formFeedback = document.getElementById('formFeedback'); // Display feedback message

  // Reset feedback messages
  formFeedback.textContent = '';
  
  // Name validation (Non-empty and no numbers)
  if (!name || /\d/.test(name)) {
    formFeedback.textContent = "Invalid name. Name cannot be empty and should not contain numbers.";
    formFeedback.style.color = "red";
    return false; // Prevent form submission
  }

  // Email validation (Basic email format)
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email || !emailPattern.test(email)) {
    formFeedback.textContent = "Invalid email address.";
    formFeedback.style.color = "red";
    return false; // Prevent form submission
  }

  // Phone validation (Only numbers and a valid phone length)
  const phonePattern = /^\d{10}$/;
  if (!phone || !phonePattern.test(phone)) {
    formFeedback.textContent = "Invalid phone number. It should contain 10 digits.";
    formFeedback.style.color = "red";
    return false; // Prevent form submission
  }

  // Password validation (Minimum 8 characters)
  if (password.length < 8) {
    formFeedback.textContent = "Password must be at least 8 characters long.";
    formFeedback.style.color = "red";
    return false; // Prevent form submission
  }


  return true; 
}

// Example of attaching the validation to a submit button
document.getElementById('submitButton').addEventListener('click', function (event) {
  event.preventDefault(); // Prevent the default form submission
  if (validateForm()) {
    document.getElementById('yourFormId').submit();
  }
});

























const alertBox = document.getElementById("alertBox");
alertBox.classList.add("show");
setTimeout(() => {
  alertBox.classList.remove("show");
  alertBox.classList.add("hide");
  setTimeout(() => {
    alertBox.style.display = "none";
  }, 500); 
}, 3000); 

if (window.location.search) {
  const url = window.location.origin + window.location.pathname;
  window.history.replaceState({}, document.title, url);
}