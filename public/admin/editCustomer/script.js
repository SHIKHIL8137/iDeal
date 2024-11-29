// validating the new mail id 
let debounceTimeout;
const submitButton = document.getElementById('submitButton');
const feedback = document.getElementById('emailFeedback');

function isValidEmail(email) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}

async function checkEmail(event) {
  const email = event.target.value.trim(); // Trim extra spaces
  clearTimeout(debounceTimeout);

  // Early return if email is invalid
  if (!isValidEmail(email)) {
    feedback.textContent = "Please enter a valid email address.";
    feedback.style.color = "orange";
    submitButton.disabled = true;
    return;
  }

  debounceTimeout = setTimeout(async () => {
    try {
      console.log('Checking email...');
      const response = await fetch(`/admin/check-email?email=${encodeURIComponent(email)}`);
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const result = await response.json();

      if (result.exists) {
        feedback.textContent = "Email already exists.";
        feedback.style.color = "red";
      } else {
        feedback.textContent = "Email is available.";
        feedback.style.color = "green";;
      }
    } catch (error) {
      console.error("Error checking email:", error);
      feedback.textContent = "Unable to check email. Please try again later.";
      feedback.style.color = "red";
      submitButton.disabled = true;
    }
  }, 500); // Delay in milliseconds
}

// Attach the event listener to your input field
document.getElementById('emailInput').addEventListener('input', checkEmail);




