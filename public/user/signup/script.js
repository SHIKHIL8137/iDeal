
// hide and unhide the password
document.getElementById('togglePassword').addEventListener('click',function(){
  const passwordField=document.getElementById('password');
  const type= passwordField.getAttribute('type')==="password"?"text":"password";
  passwordField.setAttribute('type',type);
  this.innerHTML=type==="password"?' <i class="fa fa-eye" aria-hidden="true"></i>' : ' <i class="fa fa-eye-slash" aria-hidden="true"></i>';
})
document.getElementById('toggleCPassword').addEventListener('click',function(){
  const passwordField=document.getElementById('conformPassword');
  const type= passwordField.getAttribute('type')==="password"?"text":"password";
  passwordField.setAttribute('type',type);
  this.innerHTML=type==="password"?' <i class="fa fa-eye" aria-hidden="true"></i>' : ' <i class="fa fa-eye-slash" aria-hidden="true"></i>';
})

// sign up form validation
document.getElementById('signupForm').addEventListener('submit', function (e) {
  const password = document.getElementById('password').value.trim();
  const confirmPassword = document.getElementById('conformPassword').value.trim();
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const referralCodeInput = document.getElementById('referral').value.trim();

  const errMsg = document.getElementById('errorMsg');
  const checkBox = document.getElementById('agreeCheckBox');
  const agreeText = document.getElementById('agreetxt');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Reusable function to show error messages
  const showError = (message) => {
    e.preventDefault();
    errMsg.innerHTML = message;
    errMsg.classList.add('alert', 'alert-danger', 'text-center');
    errMsg.style.fontSize = '12px';
    errMsg.style.display = 'block';
    setTimeout(() => {
      errMsg.innerHTML = '';
      errMsg.style.display = 'none';
    }, 3000);
  };

  if (username === "") return showError('Enter a valid username');
  if (!emailRegex.test(email)) return showError('Enter a valid email address');
  if (password.length < 8) return showError('The password should be at least 8 characters');
  if (password !== confirmPassword) return showError('The password and confirm password do not match');
  if (referralCodeInput && referralCodeInput.length !==10) return showError('The refferal code shoud be length of 10');
  if (!checkBox.checked) {
    e.preventDefault();
    agreeText.classList.add('shake');
    agreeText.style.color = 'red';
    setTimeout(() => {
      agreeText.style.color = '';
      agreeText.classList.remove('shake');
    }, 1000);
  }
});


// if the referral is in the query params it will show in the input field
const queryParams = new URLSearchParams(window.location.search);
const referralCode = queryParams.get('ref');

document.addEventListener('DOMContentLoaded', () => {
  const referralInput = document.getElementById('referral');
  if (referralCode) {
    referralInput.value = referralCode; 
  }
});


// show ing the error message
const serverMsgError=document.getElementById('serverMsg');
if(serverMsgError){
  serverMsgError.classList.add('alert', 'alert-danger', 'text-center');
    serverMsgError.style.fontSize='12px';
  setTimeout(()=>{
    serverMsgError.style.display='none'
  },3000)
}



 

  