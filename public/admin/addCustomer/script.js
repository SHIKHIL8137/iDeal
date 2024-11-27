

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById('yourFormId');
  const errorMessages = document.querySelectorAll(".error-message");

  form.addEventListener("submit", (event) => {
    let isValid = true;

    // Clear all previous error messages
    errorMessages.forEach((error) => {
      error.textContent = "";
    });
    // category Name Validation
    const name = document.getElementById("name");
    if (!name.value.trim()) {
      setError(name, "Name is required.");
      isValid = false;
    }
    //  Description Validation
    const email = document.getElementById("email");
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email.value.trim() || !emailPattern.test(email.value)) {
      setError(email, "Invalid email address.");
      isValid = false;
    }
    // status Validation
    const phone = document.getElementById("phone");
    const phonePattern = /^\d{10}$/;
    if (!phone.value || !phonePattern.test(phone.value)) {
      setError(phone, "Invalid phone number. It should contain 10 digits.");
      isValid = false;
    }
    const password = document.getElementById("password");
    if (password.value.length<8) {
      setError(password, "Password must be at least 8 characters long.");
      isValid = false;
    }

    // Prevent form submission if validation fails
    if (!isValid) {
      event.preventDefault();
    }
  });

  // Helper function to set error messages
  function setError(input, message) {
    const errorContainer = input.nextElementSibling;
    if (errorContainer && errorContainer.classList.contains("error-message")) {
      errorContainer.style.color = 'red';
      errorContainer.textContent = message;
      setTimeout(()=>{
        errorContainer.textContent='';
      },5000);
    }
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