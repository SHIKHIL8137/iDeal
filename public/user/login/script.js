
// hide and unhide the password
document.getElementById('togglePassword').addEventListener('click',function(){
  const passwordField=document.getElementById('password');
  const type= passwordField.getAttribute('type')==="password"?"text":"password";
  passwordField.setAttribute('type',type);
  this.innerHTML=type==="password"?' <i class="fa fa-eye" aria-hidden="true"></i>' : ' <i class="fa fa-eye-slash" aria-hidden="true"></i>';
})

// validation for email and password
document.getElementById('loginForm').addEventListener('submit', (e) => {
  const email = document.getElementById('email').value.trim(); 
  const password = document.getElementById('password').value.trim(); 
  const errMsg = document.getElementById('errorMsg');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) { 
    e.preventDefault();
    errMsg.innerHTML = 'Enter a valid email address';
    errMsg.classList.add('alert', 'alert-danger', 'text-center');
    errMsg.style.fontSize = '12px';
    errMsg.style.display = 'block';
    setTimeout(() => {
      errMsg.innerHTML = '';
      errMsg.style.display = 'none';
    }, 3000);
  } else if (password === "") { 
    e.preventDefault();
    errMsg.innerHTML = 'Invalid password';
    errMsg.classList.add('alert', 'alert-danger', 'text-center');
    errMsg.style.fontSize = '12px';
    errMsg.style.display = 'block';
    setTimeout(() => {
      errMsg.innerHTML = '';
      errMsg.style.display = 'none';
    }, 3000);
  }
});






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