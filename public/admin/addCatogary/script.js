document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const errorMessages = document.querySelectorAll(".error-message");

  form.addEventListener("submit", (event) => {
    let isValid = true;

    // Clear all previous error messages
    errorMessages.forEach((error) => {
      error.textContent = "";
    });
    // category Name Validation
    const categoryName = document.getElementById("categoryName");
    if (!categoryName.value.trim()) {
      setError(categoryName, "Category name is required.");
      isValid = false;
    }
    //  Description Validation
    const description = document.getElementById("description");
    if (!description.value.trim()) {
      setError(description, "Description is required.");
      isValid = false;
    }
    // status Validation
    const status = document.getElementById("status");
    if (!status.value) {
      setError(status, "Please select a status option.");
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

  
  document.getElementById('cancelbtn').addEventListener('click',function(){
    window.location.href = `/admin/category`;
  })

  

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