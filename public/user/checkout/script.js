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
})
