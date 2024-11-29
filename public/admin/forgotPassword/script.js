document.getElementById('emailForm').addEventListener('submit', function (e) {
  const emailInput = document.getElementById('email');
  const errMsg = document.getElementById('errorMsg');
  const email = emailInput.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  errMsg.innerHTML = '';
  errMsg.style.display = 'block';

  // Validation for matching passwords
  if (!emailRegex.test(email)) {
    e.preventDefault();
    console.log('error')
    errMsg.innerHTML = 'Invalid email';
    errMsg.classList.add('alert', 'alert-danger', 'text-center');
    errMsg.style.fontSize = '12px';
    setTimeout(() => {
      errMsg.innerHTML = '';
      errMsg.style.display = 'none';
    }, 3000);
    return;
  }
});



// alert box
const alertBox = document.getElementById("alertBox");
  alertBox.classList.add("show");
  setTimeout(() => {
    alertBox.classList.remove("show");
    alertBox.classList.add("hide");
    setTimeout(() => {
      alertBox.style.display = "none";
    }, 500); 
  }, 3000); 




// remove the params from url
if (window.location.search) {
  const url = window.location.origin + window.location.pathname;
  window.history.replaceState({}, document.title, url);
}