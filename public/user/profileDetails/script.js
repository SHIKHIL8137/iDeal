let user;
async function getUserDetails(){
try {
 const response = await fetch('/user/getUserDetails')
 if(!response.ok) throw Error('Error to fetch data') ;
 const result = await response.json();
if(result.status){
  user = result.user;
  renderUserDetails(result.user);
}else{
  showAlert('An error occure to fetch the data please try again later');
}
} catch (error) {
 showAlert('Error Occure') ;
}
}

function renderUserDetails(user) {
  const defaultProfilePicture = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';

  document.getElementById('profilePreview').src = user?.profilePicture || defaultProfilePicture;
  document.getElementById('firstName').value = user?.firstName || '';
  document.getElementById('secondName').value = user?.lastName || '';
  document.getElementById('username').value = user?.username || '';
  document.getElementById('email').value = user?.email || '';
  document.getElementById('secondaryEmail').value = user?.secondEmail || '';
  document.getElementById('phone').value = user?.phone || '';
}




let emailValid = true;
let otherField = true;

const resultMessage = document.getElementById('alertBox');
document.addEventListener('DOMContentLoaded', function () {
  getUserDetails();
  const searchEmail = document.getElementById('email');
  const message = document.getElementById('message');
  let debounceTimeout = null;

  searchEmail.addEventListener('input', function () {
    const query = searchEmail.value.trim();
    console.log('clicked');

    clearTimeout(debounceTimeout);

    debounceTimeout = setTimeout(function () {
      if (query.length > 0) {
        if (isValidEmail(query)) {
          fetchEmail(query); 
        } else {
          message.innerHTML = 'Invalid email format';
          message.style.color = 'red';
          emailValid = false;
        }
      } else {
        message.innerHTML = ''; 
      }
    }, 100); 
  });

  async function fetchEmail(query) {
    try {
      console.log('featched');
      const response = await fetch(`/user/check-email?email=${encodeURIComponent(query)}&userEmail=${user.email}`);
      const result = await response.json();

      if (result.exists) {
        message.innerHTML = 'Email exists';
        emailValid = false;
      } else{
        message.innerHTML = 'email Available';
        message.style.color = 'green';
        emailValid = true
      }
    } catch (error) {
      console.error(error);
      message.innerHTML = 'An error occurred. Please try again.';
      timerStart();
    }
  }

  function timerStart() {
    setTimeout(() => {
      message.innerHTML = '';
    }, 5000); 
  }
});

function isValidPhone(phone){
  const phoneRegex = /^[1-9]\d{9}$/
  return phoneRegex.test(phone);
 }

 function isValidEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email);
}




// cropping image

let cropper; 
let croppedFile = null;

document.getElementById('profilePreview').addEventListener('click', function() {
  document.getElementById('profilePicture').click(); 
});

document.getElementById('profilePicture').addEventListener('change', function (event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const imageUrl = e.target.result;
      document.getElementById('imageToCrop').src = imageUrl;
      $('#imageCropModal').modal('show');

      if (cropper) {
        cropper.destroy();
      }

   
      cropper = new Cropper(document.getElementById('imageToCrop'), {
        aspectRatio: 1, 
        viewMode: 1,
      guides: true,
      background: false,
      autoCropArea: 1,
      zoomable: true,
      });
    };
    reader.readAsDataURL(file);
  }
});


document.getElementById('cropImage').addEventListener('click', function() {
  const croppedCanvas = cropper.getCroppedCanvas();
  const croppedImage = croppedCanvas.toDataURL(); 
  document.getElementById('profilePreview').src = croppedImage;
  $('#imageCropModal').modal('hide');


  croppedCanvas.toBlob(function(blob) {
    croppedFile = new File([blob], 'cropped-image.png', { type: 'image/png' });
  });
});


// userDetails update ajax

document.getElementById('userDetailsForm').addEventListener('submit', function (event) {
  event.preventDefault(); 

  const phone = document.getElementById('phone').value.trim();
  const semail = document.getElementById('secondaryEmail').value.trim();
  const semailmessage = document.getElementById('Semailmessage');
  const phonemessage = document.getElementById('phonemessage');

  if(!isValidPhone(phone)){
   phonemessage.innerHTML='invalid number'
   phonemessage.style.color = 'red';
   return
  }
  if(!isValidEmail(semail)){
    semailmessage.innerHTML = 'invalid email';
    semailmessage.style.color = 'red';
    return
  }

  console.log(emailValid)
  if(!emailValid) return

  const confirmSaveModal = new bootstrap.Modal(document.getElementById('confirmSaveModal'));
  confirmSaveModal.show();
});

document.getElementById('confirmSaveButton').addEventListener('click', async function () {
  const formData = new FormData(document.getElementById('userDetailsForm'));
  const confirmSaveModal = bootstrap.Modal.getInstance(document.getElementById('confirmSaveModal'));
  confirmSaveModal.hide();
  if (croppedFile) {
    formData.set('profilePicture', croppedFile);
  }

  try {
    const response = await fetch('/user/saveUserDetails', {
      method: 'POST',
      body: formData, 
    });

    if (response.ok) {
      await response.json();
      showAlert('Form submitted successfully!', 'success');
      getUserDetails();
    } else {
      showAlert('Failed to submit the form. Please try again.', 'danger');
    }
  } catch (error) {
    console.error('Error submitting the form:', error);
    alert('An error occurred while submitting the form.');
  }
});


function showAlert(message, type = 'success') {

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


// password validation and ajax post request

document.getElementById('updatePassword').addEventListener('submit', async function (event) {
  event.preventDefault();

  const currentPassword = document.getElementById('currentPassword').value.trim();
  const newPassword = document.getElementById('newPassword').value.trim();
  const confirmPassword = document.getElementById('confirmPassword').value.trim();
  const message = document.getElementById('passwordMessage');


  if (!newPassword || !confirmPassword) {
    message.innerHTML = 'All fields are required.';
    message.style.color = 'red';
    return;
  }


  if (newPassword.length < 8) {
    message.innerHTML = 'New password must be at least 8 characters long.';
    message.style.color = 'red';
    return;
  }


  if (newPassword !== confirmPassword) {
    message.innerHTML = 'New password and confirm password do not match.';
    message.style.color = 'red';
    return;
  }


  const requestData = {
    currentPassword,
    newPassword,
  };


  const confirmSaveModal = new bootstrap.Modal(document.getElementById('confirmSavePasswordModal'));
  confirmSaveModal.show();

  document.getElementById('confirmPasswordButton').addEventListener('click', async function () {
    const confirmSaveModal = bootstrap.Modal.getInstance(document.getElementById('confirmSavePasswordModal'));
    confirmSaveModal.hide();

    try {
      const response = await fetch('/user/updatePassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', 
        },
        body: JSON.stringify(requestData),  
      });

      const result = await response.json();

      if (response.ok) {
        showAlert(result.message, 'success');     
        getUserDetails();
          document.getElementById('currentPassword').value='';
          document.getElementById('newPassword').value='';
          document.getElementById('confirmPassword').value='';
      } else {
        showAlert(result.message || 'Failed to update password. Please try again.', 'danger');
      }
    } catch (error) {
      console.error('Error submitting the form:', error);
      showAlert('An error occurred while updating the password.', 'danger');
    }
  });
});

// Reusable alert function
function showAlert(message, type) {
  const alertBox = document.getElementById('alertBox');
  alertBox.innerHTML = message;
  alertBox.className = `alert alert-${type} show`;
  setTimeout(() => {
    alertBox.className = `alert alert-${type} hide`;
  }, 3000);
}









