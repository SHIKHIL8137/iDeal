const form = document.getElementById('form');
const result = document.getElementById('submitBtn');



document.addEventListener('DOMContentLoaded',getCartCount)
async function getCartCount(){
try {
    const res = await fetch("/user/cartCount");
    const data = await res.json();
    const badge = document.getElementById("cartCount");

    if (data.count > 0) {
      badge.textContent = data.count;
      badge.style.display = "flex";
    }
  } catch (err) {
    console.error("Cart count load failed:", err);
  }
}


function validation() {
  const firstName = document.getElementById('firstName').value.trim();
  const secondName = document.getElementById('secondName').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phoneNumber').value.trim();
  const message = document.getElementById('message').value.trim();

  const errorMsg = document.querySelector('.error');
  let error = "";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
  const phoneRegex = /^[0-9]{10}$/; 

  if (!firstName) error = "First name is required.";
  else if (!secondName) error = "Second name is required.";
  else if (!email) error = "Email is required.";
  else if (!emailRegex.test(email)) error = "Enter a valid email address.";
  else if (!phone) error = "Phone number is required.";
  else if (!phoneRegex.test(phone)) error = "Enter a valid 10-digit phone number.";
  else if (!message) error = "Message is required.";

  if (error) {
    showError(error);
    return false; 
  }
  return true; 
}



function showError(msg){
  errorMsg.style.display = 'block';
  errorMsg.textContent = msg;
  errorMsg.style.color = 'red';
  setTimeout(()=>{
  errorMsg.style.display = 'none';
  },3000);
}

form.addEventListener('submit', function (e) {
  e.preventDefault();

  if (!validation()) return;

  const formData = new FormData(form); 
  const object = Object.fromEntries(formData.entries()); 
  const json = JSON.stringify(object); 

  result.innerHTML = "Please wait...";

  fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: json,
  })
    .then(async (response) => {
      const json = await response.json();
      if (response.status === 200) {
        showAlert("Form submitted successfully!",'success');
      } else {
        console.error(response);
        showAlert("Submission failed!",'danger');
      }
    })
    .catch((error) => {
      console.error(error);
      showAlert("Something went wrong!",'danger')
    })
    .finally(() => {
      form.reset();
      setTimeout(() => {
        result.style.display = "none";
      }, 3000);
    });
});


function showAlert(message, type) {
  const alertBox = document.getElementById('alertBox');
  alertBox.innerHTML = message;
  alertBox.className = `alert alert-${type} show`;
  setTimeout(() => {
    alertBox.className = `alert alert-${type} hide`;
  }, 3000);
}

function showError(msg) {
  const errorMsg = document.querySelector('.error');
  errorMsg.style.display = 'block';
  errorMsg.textContent = msg;
  errorMsg.style.color = 'red';
  setTimeout(() => {
    errorMsg.style.display = 'none';
  }, 3000);
}