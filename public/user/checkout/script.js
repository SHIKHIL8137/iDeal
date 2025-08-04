
let selectedDeliveryAddress; 
let addresses = []; 



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


document.addEventListener('DOMContentLoaded', async () => {
  getCheckOutData();
});

async function getCheckOutData() {
  try {
    const response = await fetch('/user/getCheckOutData');
    if (!response.ok) throw Error('Error fetching the user details');
    const result = await response.json();
    if (result.status) {
      addresses = result.user.addresses; 
      renderData(result.user);
      selectedDeliveryAddress = addresses[0]; 
    } else {
      showAlert('Error fetching the data', 'danger');
    }
  } catch (error) {
    showAlert('Error occurred', 'danger');
  }
}

function renderData(data) {
  const deliveryAddressContainer = document.getElementById('deliveryAddress');
  deliveryAddressContainer.innerHTML = addresses.map((address, index) => `
    <div class="form-check">
      <input class="form-check-input" type="radio" name="address" id="address${index}" 
        ${index === 0 ? 'checked' : ''} 
        onchange="selectDeliveryAddress('${address._id}')">
      <label class="form-check-label" for="address${index}">
        <b>${address.fname} ${address.lname}</b> &nbsp;&nbsp; ${address.phone}<br>
        ${address.houseName}, ${address.city}, ${address.state}<br>
        ${address.country}, Pin: ${address.zipCode}<br>
        ${address.email}
      </label>
      <div class="float-end">
        <button class="btn btn-outline-primary" onclick="editAddress('${address._id}')">Edit</button>
        <button class="btn btn-outline-danger ms-2" onclick="deleteAddress('${address._id}')">Delete</button>
      </div>
    </div>
    <hr>
  `).join('') + `<button class="btn btn-primary mt-3" onclick="addAddress()">Add Address</button>`;

  if (document.getElementById("sameAsDelivery").checked) {
    fillBillingAddressForm(selectedDeliveryAddress);
  }
}

function selectDeliveryAddress(addressId) {
  selectedDeliveryAddress = addresses.find(address => address._id === addressId); // Use global addresses

  if (document.getElementById("sameAsDelivery").checked) {
    fillBillingAddressForm(selectedDeliveryAddress);
  }
}


function fillBillingAddressForm(address) {
  document.getElementById("billingFirstName").value = address.fname;
  document.getElementById("billingLastName").value = address.lname;
  document.getElementById("billingCompany").value = address.companyName || '';
  document.getElementById("billingHouseName").value = address.houseName;
  document.getElementById("billingCountry").value = address.country;
  document.getElementById("billingState").value = address.state;
  document.getElementById("billingCity").value = address.city;
  document.getElementById("billingZip").value = address.zipCode;
  document.getElementById("billingEmail").value = address.email;
  document.getElementById("billingPhone").value = address.phone;
}

document.getElementById("sameAsDelivery").addEventListener('change', function() {
  if (this.checked) {
    if (selectedDeliveryAddress) {
      fillBillingAddressForm(selectedDeliveryAddress);  
    }
  } else {
    clearBillingAddressForm(); 
  }
});


function clearBillingAddressForm() {
  document.getElementById("billingFirstName").value = '';
  document.getElementById("billingLastName").value = '';
  document.getElementById("billingCompany").value = '';
  document.getElementById("billingHouseName").value = '';
  document.getElementById("billingCountry").value = '';
  document.getElementById("billingState").value = '';
  document.getElementById("billingCity").value = '';
  document.getElementById("billingZip").value = '';
  document.getElementById("billingEmail").value = '';
  document.getElementById("billingPhone").value = '';
}



function editAddress(id) {
  window.location.href = `/user/editAddress/${id}`;
}


async function deleteAddress(id){
  if(confirm('Are you sure you want to delete this address?')){
    try {
      const response = await fetch(`/user/deleteAddress/${id}`,{
        method : 'DELETE'
      })
      if(!response.ok) throw Error('Error to delete the address please try again later');
      const result = await response.json();
      if(result.status){
       showAlert('Address Deleted Successfully','success');
       getCheckOutData();
      }else{
        showAlert('An error occur address deletion try again later','danger')
      }
    } catch (error) {
      showAlert('Internal Server error please again later','danger');
    }
  }
}


function addAddress() {
  window.location.href = '/user/address';
}

document.addEventListener('DOMContentLoaded',async()=>{
try {
  const response = await fetch('/user/checkoutSummery');
  const checkOutData = await response.json();
  if(checkOutData){
    document.querySelector('.cart-summary').innerHTML = `
      <h5>Summary</h5>
  <p>Sub-total: <span class="float-end">₹${checkOutData.totalAmount.toLocaleString()}</span></p>
  <p>Shipping Fees: <span class="float-end text-success">${checkOutData.deliveryFee === 0 ? 'Free' : `₹${checkOutData.deliveryFee.toLocaleString()}`}</span></p>
  <p>Coupon Discount: <span id="couponDiscount" class="float-end text-danger">₹0</span></p>
  <p>Category Discount: <span class="float-end text-danger">-₹${checkOutData.categoryDiscount.toLocaleString()}</span></p>
  <hr>
  <p>Total: <span id="finalTotal" class="float-end">₹${checkOutData.finalTotal.toLocaleString()}</span></p>

  <!-- Coupon Section -->
  <div id="couponSection" class="mt-3">
    <div id="couponInput">
      <label for="coupon" class="form-label">Enter a coupon code</label>
      <div class="input-group">
        <input type="text" id="coupon" class="form-control" placeholder="Coupon Code" aria-label="Coupon Code">
        <button class="btn btn-primary" type="button" onclick="applyCoupon()" id="applyCouponButton" 
          ${checkOutData.totalAmount <= 0 ? 'disabled' : ''}>Apply</button>
      </div>
      <small class="d-block mt-1 couponNote">Note: Only one coupon can be applied.</small>
    </div>

    <div id="appliedCoupon" class="d-none position-relative">
      <span class="badge bg-success p-3 d-flex align-items-center">
        <i class="bi bi-tag-fill me-2"></i>
        Applied Coupon: <span id="appliedCouponCode"></span>
      </span>
      <button class="btn btn-sm position-absolute" onclick="removeCoupon()" id="closeBtnCoupon">
        <i class="bi bi-x-circle"></i>
      </button>
    </div>
  </div>
  <button class="btn btn-primary btn-block mt-4 w-100" id="placeOrder">Place Order</button>
    `;
  }else{
    document.querySelector('.cart-summary').innerHTML = '<p>No data available. please try again</p>';
  } 
} catch (error) {
  console.log(error);
  showAlert('an error occure please try again later','danger');
}




function selectDeliveryAddress(addressId) {
  const selectedAddressRadio = document.querySelector('input[name="address"]:checked');
  const selectedIndex = selectedAddressRadio ? selectedAddressRadio.id.replace('address', '') : 0;

  selectedDeliveryAddress = addresses[selectedIndex];
  if (document.getElementById("sameAsDelivery").checked) {
    fillBillingAddressForm(selectedDeliveryAddress);
  }
}


document.getElementById('placeOrder').addEventListener('click', async (e) => {
  e.preventDefault();
  if (!validateForm()) return;
   document.getElementById('placeOrder').disabled = true;
  document.getElementById('placeOrder').textContent = 'Placing Order...'
  try {
    const paymentMethod = document.querySelector('input[name="payment"]:checked')?.id || "COD";
    const selectedAddressRadio = document.querySelector('input[name="address"]:checked');
    const selectedIndex = selectedAddressRadio ? selectedAddressRadio.id.replace('address', '') : 0;
    const selectedDeliveryAddress = addresses[selectedIndex];
    const totalAmount = parseInt(document.getElementById('finalTotal').textContent.replace(/[₹,]/g, '').trim());
    const couponDiscount = parseInt(document.getElementById('couponDiscount').textContent.replace(/[₹,]/g, '').trim()) || 0;
    const couponCode = document.getElementById('coupon').value.trim() || 'N/A';
    const billingAddress = {
      fname: document.getElementById("billingFirstName").value,
      lname: document.getElementById("billingLastName").value,
      companyName: document.getElementById("billingCompany").value,
      houseName: document.getElementById("billingHouseName").value,
      country: document.getElementById("billingCountry").value,
      state: document.getElementById("billingState").value,
      city: document.getElementById("billingCity").value,
      zipCode: document.getElementById("billingZip").value,
      email: document.getElementById("billingEmail").value,
      phone: document.getElementById("billingPhone").value,
    };

    const orderDetails = {
      deliveryAddress: selectedDeliveryAddress,
      billingAddress,
      paymentMethod,
      totalAmount,
      couponDiscount,
      couponCode
    };

    if(paymentMethod === 'COD'){
      if(totalAmount< 1000) return showAlert('Order above 1000 allowed for COD','danger');
    }

    const response = await fetch("/user/orderSubmit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderDetails),
    });

    const result = await response.json();
    if (response.ok) {
      if (paymentMethod === 'razorPay' && result.razorPayOrderId) {
        const rzp = new Razorpay({
          key: result.razorPayKey,
          amount: result.totalAmount * 100,
          currency: 'INR',
          order_id: result.razorPayOrderId,
          handler: async (razorpayResponse) => {
            if (!razorpayResponse.razorpay_payment_id) {
              showAlert('Payment failed. Please try again.', 'danger');
              rzp.close();
              return;
            }
            const verifyResponse = await fetch(`/user/verify-payment/${result.orderId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(razorpayResponse),
            });

            const verificationResult = await verifyResponse.json();
            if (verificationResult.success) {
              window.location.href = `/user/loadOrderConformation/${verificationResult.orderId}`;
            } else {
              rzp.close();
              showAlert('Payment Verification Failed!','danger');
            }
          },
          modal: {
            ondismiss: () => {
              showAlert('Payment was not completed. Please try again.', 'warning');
            },
          },
        });
        rzp.on('payment.failed', (response) => {
          window.open(`/user/faild`, '_blank');
          window.location.href = '/user/cart';
          rzp.close(); 
        });
        rzp.open();
      } else if (paymentMethod === 'COD') {
          window.open(`/user/loadOrderConformation/${result.orderId}`, '_blank');
          window.location.href = '/user/cart';
      } else if (paymentMethod === 'Wallet') {
        window.open(`/user/loadOrderConformation/${result.orderId}`, '_blank');
        window.location.href = '/user/cart';
      }
    } else {
      showAlert(`Failed to place order: ${result.message}`,'danger');
    }
  } catch (error) {
    console.error("Error placing order:", error);
    showAlert("An error occurred while placing the order. Please try again.",danger);
  }finally{
          document.getElementById('placeOrder').disabled = false;
      document.getElementById('placeOrder').textContent = 'Place Order'
  }
});




function validateForm() {
  const firstName = document.getElementById('billingFirstName').value.trim();
  const lastName = document.getElementById('billingLastName').value.trim();
  const companyName = document.getElementById('billingCompany').value.trim();
  const address = document.getElementById('billingHouseName').value.trim();
  const country = document.getElementById('billingCountry').value.trim();
  const state = document.getElementById('billingState').value.trim();
  const city = document.getElementById('billingCity').value.trim();
  const zipCode = document.getElementById('billingZip').value.trim();
  const email = document.getElementById('billingEmail').value.trim();
  const phone = document.getElementById('billingPhone').value.trim();

  let isValid = true;

  document.querySelectorAll('.error').forEach(error => error.remove());

  if (firstName === '') {
    displayError('billingFirstName', 'First name is required');
    isValid = false;
  }
  if (lastName === '') {
    displayError('billingLastName', 'Last name is required');
    isValid = false;
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    displayError('billingEmail', 'Please enter a valid email');
    isValid = false;
  }

  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(phone)) {
    displayError('billingPhone', 'Please enter a valid phone number (10 digits)');
    isValid = false;
  }

  const zipCodeRegex = /^\d{6}$/;
  if (!zipCodeRegex.test(zipCode)) {
    displayError('billingZip', 'Please enter a valid zip code');
    isValid = false;
  }

  if (address === '') {
    displayError('billingHouseName', 'Address is required');
    isValid = false;
  }
  if (state === '') {
    displayError('billingState', 'State is required');
    isValid = false;
  }
  if (city === '') {
    displayError('billingCity', 'City is required');
    isValid = false;
  }
  if (country === 'Select...') {
    displayError('billingCountry', 'Please select a country');
    isValid = false;
  }

  return isValid;
}

function displayError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const error = document.createElement('div');
  error.classList.add('error');
  error.style.color = 'red';
  error.textContent = message;
  field.parentElement.appendChild(error);

  if (document.querySelector('.error') === error) {
    field.scrollIntoView({ behavior: 'smooth' });
    field.focus();
  }
}
})





const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
const closeSidebarBtn = document.getElementById('closeSidebarBtn');
const couponSidebar = document.getElementById('couponSidebar');

toggleSidebarBtn.addEventListener('click', () => {
    couponSidebar.classList.add('active');
});

closeSidebarBtn.addEventListener('click', () => {
    couponSidebar.classList.remove('active');
});

function copyCouponCode(couponId) {
  const couponCodeInput = document.getElementById('couponCode' + couponId);
  const badge = document.getElementById('badge' + couponId);

  navigator.clipboard.writeText(couponCodeInput.value).then(() => {
      badge.classList.add('show');
      setTimeout(() => {
          badge.classList.remove('show');
      }, 2000);
  }).catch(err => {
    showAlert('Failed to copy coupon code: ', 'danger');
  });
}





function applyCoupon() {
  const currentTotal = parseInt(document.getElementById('finalTotal').textContent.replace(/[₹,]/g, '').trim());
  const couponInput = document.getElementById('coupon');
  const couponCode = couponInput.value.trim();

console.log('clicked')
  if (!couponCode) {
    alert('Please enter a coupon code.');
    return;
  }

  const applyButton = document.getElementById('applyCouponButton');
  applyButton.disabled = true;
  applyButton.textContent = 'Applying...';

  fetch('/user/applyCoupon', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ couponCode: couponCode ,currentTotal : currentTotal}),
  })
    .then(response => response.json())
    .then(result => {
      applyButton.disabled = false;
      applyButton.textContent = 'Apply';

      if (result.success) {
        console.log(result.newTotalAmount)
        showAlert(result.message,'success');
        document.getElementById('couponDiscount').textContent = `₹${result.discount}`;
        document.getElementById('finalTotal').textContent = `₹${result.newTotalAmount}`;

        document.getElementById('couponInput').classList.add('d-none');
        const appliedCoupon = document.getElementById('appliedCoupon');
        appliedCoupon.classList.remove('d-none');
        document.getElementById('appliedCouponCode').textContent = couponCode;
      } else {
        showAlert(result.message,'danger');
      }
    })
    .catch(error => {
      console.error('Error applying coupon:', error);
      showAlert('Failed to apply coupon. Please try again.','danger');
      applyButton.disabled = false;
      applyButton.textContent = 'Apply';
    });
}

function removeCoupon() {
  fetch('/user/removeCoupon', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(response => response.json())
    .then(result => {
      if (result.success) {
        showAlert(result.message , 'success');

        document.getElementById('couponInput').classList.remove('d-none');
        document.getElementById('appliedCoupon').classList.add('d-none');

        document.getElementById('couponDiscount').textContent = '₹0';
        document.getElementById('finalTotal').textContent = `₹${result.originalTotal}`;
      } else {
        showAlert(result.message, 'danger');
      }
    })
    .catch(error => {
      console.error('Error removing coupon:', error);
      showAlert('Failed to remove coupon. Please try again.','danger');
    });
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


























