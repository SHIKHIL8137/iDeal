
// hide and unhide the password
document.getElementById('togglePassword').addEventListener('click',function(){
  const passwordField=document.getElementById('password');
  const type= passwordField.getAttribute('type')==="password"?"text":"password";
  passwordField.setAttribute('type',type);
  this.innerHTML=type==="password"?' <i class="fa fa-eye" aria-hidden="true"></i>' : ' <i class="fa fa-eye-slash" aria-hidden="true"></i>';
})


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