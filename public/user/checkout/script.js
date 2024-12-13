const userDetails = JSON.parse(document.getElementById('userData').textContent);
const addresses = userDetails.addresses;
let selectedDeliveryAddress = addresses[0];  // Initially set to the first address

document.addEventListener('DOMContentLoaded', async () => {
  const deliveryAddressContainer = document.getElementById('deliveryAddress');

  // Render delivery addresses dynamically
  deliveryAddressContainer.innerHTML = addresses.map((address, index) => `
    <div class="form-check">
      <input class="form-check-input" type="radio" name="address" id="address${index}" ${index === 0 ? 'checked' : ''} onchange="selectDeliveryAddress('${address._id}')">
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

  // Automatically fill the form if the checkbox is already checked on load
  if (document.getElementById("sameAsDelivery").checked) {
    fillBillingAddressForm(selectedDeliveryAddress);
  }
  
});

// Handle selecting a delivery address
function selectDeliveryAddress(addressId) {
  selectedDeliveryAddress = addresses.find(address => address._id === addressId);

  // If "Same as delivery address" checkbox is checked, fill the billing form with the selected delivery address
  if (document.getElementById("sameAsDelivery").checked) {
    fillBillingAddressForm(selectedDeliveryAddress);
  }
}

// Fill billing address form with delivery address data
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

// Handle the "Same as delivery address" checkbox change
document.getElementById("sameAsDelivery").addEventListener('change', function() {
  if (this.checked) {
    if (selectedDeliveryAddress) {
      fillBillingAddressForm(selectedDeliveryAddress);  // Fill form if checked
    }
  } else {
    clearBillingAddressForm();  // Clear form if unchecked
  }
});

// Clear the billing address form
function clearBillingAddressForm() {
  document.getElementById("billingFirstName").value = '';
  document.getElementById("billingLastName").value = '';
  document.getElementById("billingCompany").value = '';
  document.getElementById("billingAddress").value = '';
  document.getElementById("billingCountry").value = '';
  document.getElementById("billingState").value = '';
  document.getElementById("billingCity").value = '';
  document.getElementById("billingZip").value = '';
  document.getElementById("billingEmail").value = '';
  document.getElementById("billingPhone").value = '';
}

// Edit, delete, and add address functions
function editAddress(id) {
  window.location.href = `/user/editAddress/${id}`;
}

function deleteAddress(id) {
  if (confirm('Are you sure you want to delete this address?')) {
    fetch(`/user/deleteAddress/${id}`, { method: 'DELETE' })
      .then(response => response.json())
      .then(data => {
        if (data.message === 'Address deleted successfully') location.reload();
      })
      .catch(error => console.error('Error deleting address:', error));
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
      <p>Coupon Discount: <span class="float-end text-danger">₹${checkOutData.discount.toLocaleString()}</span></p>
      <p>Category Discount: <span class="float-end text-danger">-₹${checkOutData.categoryDiscound.toLocaleString()}</span></p>
      <hr>
      <p>Total: <span class="float-end">₹${checkOutData.finalTotal.toLocaleString()}</span></p>
      <button class="btn btn-primary btn-block mt-4 w-100" id="placeOrder">Place Order</button>
    `;
  }else{
    document.querySelector('.cart-summary').innerHTML = '<p>No data available. please try again</p>';
  } 
} catch (error) {
  alert('an error occure please try again later');
}




// Handle selecting a delivery address
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

  try {
    const paymentMethod = document.querySelector('input[name="payment"]:checked')?.id || "COD";
    const selectedAddressRadio = document.querySelector('input[name="address"]:checked');
    const selectedIndex = selectedAddressRadio ? selectedAddressRadio.id.replace('address', '') : 0;
    const selectedDeliveryAddress = addresses[selectedIndex];

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
    };

    console.log(orderDetails);

    const response = await fetch("/user/orderSubmit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderDetails),
    });

    const result = await response.json();
    console.log(result.orderId);
    if (response.ok) {
      if (paymentMethod === 'razorPay' && result.razorPayOrderId) {
        const rzp = new Razorpay({
          key: 'rzp_test_MJ6J1WvPqqk5wn',
          amount: result.totalAmount * 100,
          currency: 'INR',
          order_id: result.razorPayOrderId,
          handler: async (razorpayResponse) => {
            const verifyResponse = await fetch(`/user/verify-payment/${result.orderId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(razorpayResponse),
            });

            const verificationResult = await verifyResponse.json();

            console.log('fetchresponse :',verificationResult.orderId)
            if (verificationResult.success) {
              window.location.href = `/user/loadOrderConformation/${verificationResult.orderId}`;
            } else {
              alert('Payment Verification Failed!');
            }
          },
        });
        rzp.open();
      } else if (paymentMethod === 'COD') {
        window.open(`/user/loadOrderConformation/${result.orderId}`, '_blank');
        window.location.href = '/user/cart';
      }
    } else {
      console.log(`Failed to place order: ${result.message}`);
    }
  } catch (error) {
    console.error("Error placing order:", error);
    alert("An error occurred while placing the order. Please try again.");
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

  // Clear existing errors
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

// Function to display error message
function displayError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const error = document.createElement('div');
  error.classList.add('error');
  error.style.color = 'red';
  error.textContent = message;
  field.parentElement.appendChild(error);

  // Scroll to the first error for better UX
  if (document.querySelector('.error') === error) {
    field.scrollIntoView({ behavior: 'smooth' });
    field.focus();
  }
}


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


























