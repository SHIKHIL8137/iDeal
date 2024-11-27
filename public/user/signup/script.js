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

document.getElementById('signupForm').addEventListener('submit', function (e) {
  const password = document.getElementById('password').value;
  const conformPassword = document.getElementById('conformPassword').value;
  const errMsg = document.getElementById('errorMsg');
  const checkBox=document.getElementById('agreeCheckBox')
  const agreetext=document.getElementById('agreetxt');
   console.log(typeof password)
  if (password !== conformPassword) {
    e.preventDefault();
    errMsg.innerHTML = 'The password and confirm password do not match';
    errMsg.classList.add('alert', 'alert-danger', 'text-center')
    errMsg.style.fontSize='12px'
    setTimeout(() => {
      errMsg.innerHTML = '';
      errMsg.style.display = 'none';
    }, 3000);
  }else if(!checkBox.checked){
    e.preventDefault();
    agreetext.classList.add('shake');
    agreetext.style.color='red';
    setTimeout(() => {
      agreetext.style.color='';
      agreetext.classList.remove('shake');
    }, 1000);
  }else if(password.length<8){
    e.preventDefault();
    errMsg.innerHTML = 'The password should be minimum 8 characters';
    errMsg.classList.add('alert', 'alert-danger', 'text-center')
    errMsg.style.fontSize='12px'
    setTimeout(() => {
      errMsg.innerHTML = '';
      errMsg.style.display = 'none';
    }, 3000);
  }
});


const serverMsgError=document.getElementById('serverMsg');
if(serverMsgError){
  serverMsgError.classList.add('alert', 'alert-danger', 'text-center');
    serverMsgError.style.fontSize='12px';
  setTimeout(()=>{
    serverMsgError.style.display='none'
  },3000)
}



 

  