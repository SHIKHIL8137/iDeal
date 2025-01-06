const pathSegments = window.location.pathname.split('/');
const orderId = pathSegments[pathSegments.length - 1];


async function getOrderedData(){
try{
const response = await fetch(`/user/getOrderDetails/${orderId}`);
if(!response.ok) throw Error('Error fetching the order details');
const result = await response.json();
if(result.status){
  renderOrderDetails(result.order,result.returnStatusMap);
}else{
  showAlert('Error fetching the order details','danger');
}
}catch(error){
showAlert('an Error occure please refresh the page')
}
}



function renderOrderDetails(order, returnStatusMap) {
  const container = document.querySelector('#orderDetailsCard'); 
  if (!container) return;

  container.innerHTML = '';

  const orderHTML = `
      <div class="container py-5 h-80">
        <div class="row d-flex justify-content-center align-items-center h-100">
          <div class="col-lg-10 col-xl-8">
            <div class="card" style="border-radius: 10px; background-color: #1a1a1a; border: 1px solid #333;">
              <div class="card-header px-4 py-5" style="background-color: #333;">
                <h5 class="mb-0" style="color: #ffffff;">Thanks for your Order, <span style="color: #ffffff;">${order.userId.username}</span>!</h5>
              </div>
              <div class="card-body p-4">
                <div class="d-flex justify-content-between align-items-center mb-4">
                  <p class="lead fw-normal mb-0" style="color: #ffffff;">Receipt</p>
                  <p class="small mb-0" style="color: #bbb;">Receipt Voucher: ${order.orderId}</p>
                  ${
                    order.status !== 'Cancelled' && order.status !== 'Processing'
                      ? `<button class="invoiceBtn" onclick="getInvoice('${order.orderId}')">Invoice</button>`
                      : ''
                  }
                </div>
                ${order.products
                  .map((product) => {
                    const returnRequest = returnStatusMap[product.productId];
                    return `
                    <div class="card shadow-0 border mb-4" style="background-color: #2a2a2a;">
                      <div class="card-body">
                        <div class="row">
                          <div class="col-md-2">
                            <img src="${product.firstImage}" class="img-fluid" alt="${product.productName}" style="width: 60px; height: 60px; object-fit: contain; border-radius: 10px;">
                          </div>
                          <div class="col-md-2 text-center d-flex justify-content-center align-items-center">
                            <p class="mb-0" style="color: #fff;">${product.productName}</p>
                          </div>
                          <div class="col-md-2 text-center d-flex justify-content-center align-items-center">
                            <p class="mb-0 small" style="color: #bbb;">${product.productColor}</p>
                          </div>
                          <div class="col-md-2 text-center d-flex justify-content-center align-items-center">
                            <p class="mb-0 small" style="color: #bbb;">Capacity: ${product.productStorage}GB</p>
                          </div>
                          <div class="col-md-2 text-center d-flex justify-content-center align-items-center">
                            <p class="mb-0 small" style="color: #bbb;">Qty: ${product.quantity}</p>
                          </div>
                          <div class="col-md-2 text-center d-flex justify-content-center align-items-center">
                            <p class="mb-0 small" style="color: #bbb;">₹${product.total.toLocaleString()}</p>
                          </div>
                        </div>
                        <div class="text-center mt-2">
                          ${
                            order.status === 'Delivered'
                              ? returnRequest
                                ? `
                                  <p class="${
                                    returnRequest.adminStatus === 'Rejected' ? 'text-danger' : 'text-success'
                                  }">Return Request ${returnRequest.adminStatus}</p>
                                  ${
                                    returnRequest.adminStatus === 'Rejected'
                                      ? `<p class="text-danger">Reason for Rejection: ${returnRequest.reasonForRejection}</p>`
                                      : ''
                                  }
                                `
                                : `
                                  <button type="button" data-bs-toggle="modal" data-bs-target="#reviewModal" class="btn btn-outline-primary me-2" onclick="writeReview('${product.productId}')">Write a Review</button>
                                  <button type="button" data-bs-toggle="modal" data-bs-target="#returnModal" class="btn btn-outline-success return-btn" data-product-id="${product.productId}">Return Order</button>
                                `
                              : `
                                <button type="button" class="btn btn-outline-secondary" disabled>Write a Review</button>
                                <button type="button" class="btn btn-outline-secondary" disabled>Return Order</button>
                              `
                          }
                        </div>
                      </div>
                    </div>
                  `;
                  })
                  .join('')}
                <div class="d-flex justify-content-between pt-2">
                  <p class="fw-bold mb-0" style="color: #fff;">Order Details</p>
                  <p class="mb-0" style="color: #bbb;"><span class="fw-bold me-4">Total</span> ₹${order.subtotal.toLocaleString()}</p>
                </div>
                <div class="d-flex justify-content-between pt-2">
                  <p class="mb-0" style="color: #bbb;">
                    Delivery Address:<br> 
                    ${order.deliveryAddress.houseName} <br> 
                    ${order.deliveryAddress.city}, ${order.deliveryAddress.state}, ${order.deliveryAddress.country} <br> 
                    ${order.deliveryAddress.zipCode} <br>
                  </p>                
                  <p class="mb-0" style="color: #bbb;"><span class="fw-bold me-4">Discount</span> ₹${order.discount}</p>
                </div>
                <div class="d-flex justify-content-between mb-5">
                  <p class="mb-0" style="color: #bbb;">Payment Method: ${order.paymentMethod.toUpperCase()}</p>
                  <p class="mb-0" style="color: #bbb;"><span class="fw-bold me-4">Delivery Charges</span> ${
                    order.deliveryFee !== 40 ? 'Free' : '₹40'
                  }</p>
                </div>
                ${
                  order.status === 'Processing'
                    ? `<button type="button" class="btn btn-outline-danger" data-bs-toggle="modal" data-bs-target="#cancelModal" id="cancelationBtn">Cancel Order</button>`
                    : order.status === 'Cancelled'
                    ? `<p class="text-danger" id="cancelationText">Order has been cancelled</p>`
                    : ''
                }
              </div>
              <div class="card-footer border-0 px-4 py-5" style="background-color: rgb(56, 56, 56); border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">
                <h5 class="d-flex align-items-center justify-content-end text-white text-uppercase mb-0">Total paid: <span class="h2 mb-0 ms-2">₹${order.totalAmount.toLocaleString()}</span></h5>
              </div>
            </div>
          </div>
        </div>
      </div>

  `;

  container.innerHTML = orderHTML;
}








function writeReview(productId) {
  window.currentProductId = productId;
}

document.addEventListener('DOMContentLoaded', () => {
  getOrderedData()
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

let productId;
document.querySelector('#orderDetailsCard').addEventListener('click', (event) => {
  if (event.target.classList.contains('return-btn')) {
    productId = event.target.getAttribute('data-product-id');
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
          cancelModal.hide();
          getOrderedData();
          document.getElementById('cancelReason').value = '';
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
  
      sendReturnRequest(orderId, formData );
    });
  });
  
 
  

  async function sendReturnRequest(orderId, formData) {
    try {
      const userConfirmed = confirm('Are you sure you want to submit the return request?');
      if (!userConfirmed) {
        return; 
      }
  
      const response = await fetch(`/user/return-order?orderId=${orderId}&productId=${productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      const result = await response.json();
  
      if (result.status) {
        const returnModal = document.getElementById('returnModal');
        const modalInstance = bootstrap.Modal.getInstance(returnModal);
        modalInstance.hide(); 
        getOrderedData()
        showAlert('Return request submitted successfully.', 'success');
        const returnReason = document.getElementById('returnReason').value = '';
      const firstName = document.getElementById('firstName').value = '';
      const lastName = document.getElementById('lastName').value = '';
      const houseName = document.getElementById('houseName').value = '';
      const companyName = document.getElementById('companyName').value = '';
      const country = document.getElementById('country').value = '';
      const state = document.getElementById('state').value = '';
      const city = document.getElementById('city').value = '';
      const zipCode = document.getElementById('zipCode').value = '';
      const email = document.getElementById('email').value = '';
      const phone = document.getElementById('phone').value = ''; 
      } else {
        showAlert('Failed to submit the return request.', 'danger');
      }
    } catch (error) {
      console.error(error);
      showAlert('An error occurred while processing your return.', 'danger');
    }
  }
  
  
});


async function getInvoice(orderId) {
  try {
    const response = await fetch(`/user/downloadInvoice/${orderId}`, {
      method: 'GET',
    });

    if (response.ok) {
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;

      a.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else {
      console.error('Failed to fetch invoice:', await response.text());
      showAlert('Failed to download the invoice. Please try again later.','danger');
    }
  } catch (error) {
    console.error('Error fetching invoice:', error);
    showAlert('An error occurred while downloading the invoice.','danger');
  }
}





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


