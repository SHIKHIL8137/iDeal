function writeReview(productId) {

  window.currentProductId = productId;
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('reviewSubmitBtn').addEventListener('click', async (event) => {
    event.preventDefault();

    const rating = document.querySelector('input[name="rating"]:checked')?.value;
    const reviewText = document.getElementById('feedback').value;

    if (!rating || !reviewText) {
      alert('Please provide both a rating and a review.');
      return;
    }

    const reviewData = {
      rating: rating,
      reviewText: reviewText,
    };

    console.log(reviewData)

    try {

      const response = await fetch(`/user/productReview/${window.currentProductId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      if (response.ok) {
        const result = await response.text(); 
        showAlert(result,'success'); 

        const modal = bootstrap.Modal.getInstance(document.getElementById('reviewModal'));
        modal.hide();


        document.getElementById('feedback').value = ''; 
        document.querySelector('input[name="rating"]:checked').checked = false; 
      } else {
        const error = await response.text(); 
        showAlert(`Failed to submit review: ${error}`,'danger');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      showAlert('An error occurred while submitting your review.','danger');
    }
  });



  document.querySelectorAll('.cancel-order-btn').forEach(button => {
    button.addEventListener('click', async (event) => {
      const modalElement = document.getElementById("cancelModal");
      const cancelModal = bootstrap.Modal.getInstance(modalElement);
      const cancelReasonInput = document.getElementById('cancelReason');
      const reasonError = document.getElementById('reasonError');
  
      const orderId = event.target.getAttribute('data-order-id');
      if (!orderId) {
        console.error('Order ID not found on button.');
        showAlert('Order ID is missing. Please try again.', 'danger');
        return;
      }
  
      const reason = cancelReasonInput.value.trim();
      if (!reason) {
        showErrorMessage(reasonError, "Please provide a reason for cancellation.");
        return;
      }
  
      const confirmCancel = confirm('Are you sure you want to cancel this order?');
      if (!confirmCancel) return;
  
      try {
        const response = await fetch(`/user/cancel-order/${orderId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason }),
        });
  
        const result = await response.json();
  
        if (response.ok) {
          showAlert(result.message, 'success');
          event.target.setAttribute('disabled', 'true');
          cancelModal.hide();
          setTimeout(() => window.location.reload(), 2000);
        } else {
          showAlert(result.message, 'danger');
        }
      } catch (error) {
        console.error('Error:', error);
        showAlert('Failed to cancel the order. Please try again later.', 'danger');
      }
    });
  });


  document.querySelectorAll('.return-order-btn').forEach(button => {
    button.addEventListener('click', (event) => {
      const orderId = event.target.getAttribute('data-order-id');
      
      const returnReason = document.getElementById('returnReason').value.trim();
      const firstName = document.getElementById('firstName').value.trim();
      const lastName = document.getElementById('lastName').value.trim();
      const houseName = document.getElementById('houseName').value.trim();
      const companyName = document.getElementById('companyName').value.trim();
      const country = document.getElementById('country').value.trim();
      const state = document.getElementById('state').value.trim();
      const city = document.getElementById('city').value.trim();
      const zipCode = document.getElementById('zipCode').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();

      const returnReasonError = document.getElementById('returnReasonError');
      const fnameError = document.getElementById('fnameError');
      const lnameError = document.getElementById('lnameError');
      const houseNameError = document.getElementById('houseNameError');
      const countryError = document.getElementById('countryError');
      const stateError = document.getElementById('stateError');
      const cityError = document.getElementById('cityError');
      const zipCodeError = document.getElementById('zipCodeError');
      const emailError = document.getElementById('emailError');
      const phoneError = document.getElementById('phoneError');
      
      const errorMessages = document.querySelectorAll('.text-danger');
      errorMessages.forEach(error => error.classList.add('d-none'));
  
      let valid = true;
  
      if (!returnReason || returnReason.trim() === '') {
        showErrorMessage(returnReasonError, 'Return reason is required.');
        valid = false;
      } else if (returnReason.length > 300) {
        showErrorMessage(returnReasonError, 'Return reason must not exceed 300 characters.');
        valid = false
      }
  
      if (!firstName) {
        showErrorMessage(fnameError, 'First Name is required');
        valid = false;
      }
  
      if (!lastName){
        showErrorMessage(lnameError,'Last Name is required')
        valid = false;
      }

      if (!houseName) {
        showErrorMessage(houseNameError, 'House Name is required');
        valid = false;
      }
  
      if (!country || country === 'Select...') {
        showErrorMessage(countryError, 'Country is required');
        valid = false;
      }
  
      if (!state) {
        showErrorMessage(stateError, 'State is required');
        valid = false;
      }
  
      if (!city) {
        showErrorMessage(cityError, 'City is required');
        valid = false;
      }
  
      if (!zipCode) {
        showErrorMessage(zipCodeError, 'Zip Code is required');
        valid = false;
      }
  
      if (!email || !validateEmail(email)) {
        showErrorMessage(emailError, 'Valid Email is required');
        valid = false;
      }
  
      if (!phone || !validatePhone(phone)) {
        showErrorMessage(phoneError, 'Valid Phone Number is required');
        valid = false;
      }
  
      if (!valid) {
        return; 
      }
  
      const formData = {
        reason: returnReason,
        address: {
          fname:firstName,
          lname:lastName,
          companyName,
          houseName,
          country,
          state,
          city,
          zipCode,
          email,
          phone,
        },
      };
  
      sendReturnRequest(orderId, formData);
    });
  });
  
 
  

  async function sendReturnRequest(orderId, formData) {
    try {
      // Show confirmation dialog before proceeding
      const userConfirmed = confirm('Are you sure you want to submit the return request?');
      if (!userConfirmed) {
        return; // Exit if the user cancels the action
      }
  
      const response = await fetch(`/user/return-order/${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      const result = await response.json();
  
      if (result.status) {
        // Hide the return modal (Bootstrap-specific example)
        const returnModal = document.getElementById('returnModal');
        const modalInstance = bootstrap.Modal.getInstance(returnModal);
        modalInstance.hide(); // Hide the modal
        
        showAlert('Return request submitted successfully.', 'success');
  
        setTimeout(() => {
          window.location.reload();
        }, 4000);
      } else {
        showAlert('Failed to submit the return request.', 'danger');
      }
    } catch (error) {
      console.error(error);
      showAlert('An error occurred while processing your return.', 'danger');
    }
  }
  
  
});


  function validateEmail(email) {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  }
  
  function validatePhone(phone) {
    const phonePattern = /^[0-9]{10}$/; // Adjust based on your phone number format
    return phonePattern.test(phone);
  }


function showError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errorElement = document.getElementById(`${fieldId}Error`);
  
  if (errorElement) {
    errorElement.classList.remove('d-none');
    errorElement.innerText = message;
  }
  
  field.classList.add('is-invalid');
}


function showErrorMessage(errorElement,message) {
  errorElement.textContent = message;
  errorElement.classList.remove('d-none');
  setTimeout(() => errorElement.classList.add('d-none'), 3000);
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


