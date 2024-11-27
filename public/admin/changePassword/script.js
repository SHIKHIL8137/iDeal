document.getElementById('togglePassword').addEventListener('click',function(){
  const passwordField=document.getElementById('password');
  const type= passwordField.getAttribute('type')==="password"?"text":"password";
  passwordField.setAttribute('type',type);
  this.innerHTML=type==="password"?' <i class="fa fa-eye" aria-hidden="true"></i>' : ' <i class="fa fa-eye-slash" aria-hidden="true"></i>';
})
document.getElementById('conFormtogglePassword').addEventListener('click',function(){
  const passwordField=document.getElementById('conformPassword');
  const type= passwordField.getAttribute('type')==="password"?"text":"password";
  passwordField.setAttribute('type',type);
  this.innerHTML=type==="password"?' <i class="fa fa-eye" aria-hidden="true"></i>' : ' <i class="fa fa-eye-slash" aria-hidden="true"></i>';
})

document.getElementById('formId').addEventListener('submit', function (e) {
  const password = document.getElementById('password').value.trim();
  const conformPassword = document.getElementById('conformPassword').value.trim();
  const errMsg = document.getElementById('errorMsg');

  // Reset error message
  errMsg.innerHTML = '';
  errMsg.style.display = 'block';

  // Validation for matching passwords
  if (password !== conformPassword) {
    e.preventDefault();
    errMsg.innerHTML = 'The password and confirm password do not match';
    errMsg.classList.add('alert', 'alert-danger', 'text-center');
    errMsg.style.fontSize = '12px';
    setTimeout(() => {
      errMsg.innerHTML = '';
      errMsg.style.display = 'none';
    }, 3000);
    return;
  }

  // Validation for minimum password length
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



if (window.location.search) {
  const url = window.location.origin + window.location.pathname;
  window.history.replaceState({}, document.title, url);
}