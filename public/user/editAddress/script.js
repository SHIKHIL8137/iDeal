document.getElementById('cancellBtn').addEventListener('click',(e)=>{
  e.preventDefault();
  window.location.href="/user/checkOut"
})





//form validation

function validateForm(addressId) {
  const fname = document.getElementById('firstName').value.trim();
  const lname = document.getElementById('lastName').value.trim();
  const companyName = document.getElementById('companyName').value.trim();
  const houseName = document.getElementById('address').value.trim();
  const country = document.getElementById('country').value.trim();
  const state = document.getElementById('state').value.trim();
  const city = document.getElementById('city').value.trim();
  const zipCode = document.getElementById('zipCode').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();

  let isValid = true;


  document.querySelectorAll('.error').forEach(error => error.remove());


  if (fname === '') {
    displayError('firstName', 'First name is required');
    isValid = false;
  }
  if (lname === '') {
    displayError('lastName', 'Last name is required');
    isValid = false;
  }


  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (email === '' || !emailRegex.test(email)) {
    displayError('email', 'Please enter a valid email');
    isValid = false;
  }


  const phoneRegex = /^\d{10}$/;
  if (phone === '' || !phoneRegex.test(phone)) {
    displayError('phone', 'Please enter a valid phone number (10 digits)');
    isValid = false;
  }


  const zipCodeRegex = /^\d{6}$/;
  if (zipCode === '' || !zipCodeRegex.test(zipCode)) {
    displayError('zipCode', 'Please enter a valid zip code');
    isValid = false;
  }

  if (houseName === '') {
    displayError('address', 'Address is required');
    isValid = false;
  }
  if (state === '') {
    displayError('state', 'State is required');
    isValid = false;
  }
  if (city === '') {
    displayError('city', 'City is required');
    isValid = false;
  }
  if (country === 'Select...') {
    displayError('country', 'Please select a country');
    isValid = false;
  }

  if (isValid) {
    const formData={
       fname, 
       lname ,
       companyName ,
       houseName ,
       country ,
       state ,
       city ,
       zipCode ,
       email ,
       phone ,
    }
    console.log(formData)
    sendDataToTheServer(formData,addressId);
  }
}


async function sendDataToTheServer(data,addressId){
  try {
    document.getElementById('savebtn').textContent ='Saving....';
    const response = await fetch(`/user/updateAddress/${addressId}`,{
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if(!response.ok) return showAlert('An error occure submitting the data please try again later','danger');
    const result = await response.json();
    if(result.status){
      showAlert(result.message,'success');
      clearInput(result.data);
      document.getElementById('savebtn').textContent ='Save';
    }else{
      showAlert(result.message,'danger');
      document.getElementById('savebtn').textContent ='Save';
    }
  } catch (error) {
    showAlert('Internal Server Error','danger');
  }
}

function clearInput(value){
  document.getElementById('firstName').value=`${value.fname}`;
  document.getElementById('lastName').value=`${value.lname}`;
  document.getElementById('companyName').value=`${value.companyName||''}`;
  document.getElementById('address').value=`${value.houseName}`;
  document.getElementById('country').value=`${value.country}`;
  document.getElementById('state').value=`${value.state}`;
  document.getElementById('city').value=`${value.city}`;
  document.getElementById('zipCode').value=`${value.zipCode}`;
   document.getElementById('email').value=`${value.email}`;
  document.getElementById('phone').value=`${value.phone}`;
}

// Function to display error message
function displayError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const error = document.createElement('div');
  error.classList.add('error');
  error.style.color = 'red';
  error.textContent = message;
  error.style.fontSize = '12px';
  field.parentElement.appendChild(error);
  setTimeout(()=>{
  error.style.display='none';
  },3000)
}

function showAlert(message, type) {

  const alertBox = document.createElement('div');
  alertBox.id = 'alertBox';
  alertBox.className = `alert alert-${type} show`;
  alertBox.role = 'alert';
  alertBox.innerHTML = message;
  document.body.appendChild(alertBox);
  setTimeout(() => {
      alertBox.classList.remove('show');
      alertBox.classList.add('hide');
      setTimeout(() => alertBox.remove(), 700); 
  }, 3000);
}




// remove the params from the url
if (window.location.search) {
  const url = window.location.origin + window.location.pathname;
  window.history.replaceState({}, document.title, url);
}