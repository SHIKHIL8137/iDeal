//hide and un hide the password
document.getElementById('togglePassword').addEventListener('click',function(){
  const passwordField=document.getElementById('password');
  const type= passwordField.getAttribute('type')==="password"?"text":"password";
  passwordField.setAttribute('type',type);
  this.innerHTML=type==="password"?' <i class="fa fa-eye" aria-hidden="true"></i>' : ' <i class="fa fa-eye-slash" aria-hidden="true"></i>';
})


document.getElementById('emailForm').addEventListener('submit', function (e) {
  const emailInput = document.getElementById('email');
  const errMsg = document.getElementById('errorMsg');
  const password = document.getElementById('password').value.trim();
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


  // validation for password grater than 8
  if (password.length < 8) {
    e.preventDefault();
    errMsg.innerHTML = 'The password should be a minimum of 8 characters';
    errMsg.classList.add('alert', 'alert-danger', 'text-center');
    errMsg.style.fontSize = '12px';
    setTimeout(() => {
      errMsg.innerHTML = '';
      errMsg.style.display = 'none';
    }, 3000);
    return;
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