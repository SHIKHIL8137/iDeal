// cancel action
document.getElementById('cancelbtn').addEventListener('click',function(){
  window.location.href = `/admin/category`;
})

// code modal conforming the change

document.getElementById('submitButton').addEventListener('click', function () {
  const errorMessages = document.querySelectorAll(".error-message");
  errorMessages.forEach((error) => {
    error.textContent = "";
  });
  // category Name Validation
  let isValid =true;
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
  if(isValid){
    const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
  confirmationModal.show();
  }
});

document.getElementById('confirmSubmit').addEventListener('click', function () {

  document.querySelector('form').submit();
});



// remove the params from the url
if (window.location.search) {
  const url = window.location.origin + window.location.pathname;
  window.history.replaceState({}, document.title, url);
}

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