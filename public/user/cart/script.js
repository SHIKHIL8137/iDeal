async function updateQuantity(productId, action) {
  try {
    const response = await fetch('/user/updateCartQuantity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, action }),
    });

    const result = await response.json();
    if (response.ok) {
      location.reload(); 
    } else {
      showAlert('Error updating quantity','danger')
    }
  } catch (error) {
    console.error('Error updating quantity:', error);
  }
}

async function removeFromCart(productId) {
  try {
    const response = await fetch('/user/removeFromCart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    });

    const result = await response.json();
    if (response.ok) {
      location.reload();
    } else {
    showAlert('Errror removing item','danger')
    }
  } catch (error) {
    console.error('Error removing item:', error);
  }
}

function applyCoupon() {
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
    body: JSON.stringify({ couponCode: couponCode }),
  })
    .then(response => response.json())
    .then(result => {
      applyButton.disabled = false;
      applyButton.textContent = 'Apply';

      if (result.success) {
        console.log('response');
        console.log(result.newTotalAmount)
        showAlert(result.message,'success');
        document.getElementById('discountAmount').textContent = `-₹${result.discount}`;
        document.getElementById('finalTotal').textContent = `₹${result.newTotalAmount}`;

        // Hide coupon input and show applied coupon
        document.getElementById('couponInput').classList.add('d-none');
        const appliedCoupon = document.getElementById('appliedCoupon');
        appliedCoupon.classList.remove('d-none');
        document.getElementById('appliedCouponCode').textContent = couponCode;
      } else {
        console.log('error')
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
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(response => response.json())
    .then(result => {
      if (result.success) {
        showAlert(result.message , 'success');

        // Revert UI
        document.getElementById('couponInput').classList.remove('d-none');
        document.getElementById('appliedCoupon').classList.add('d-none');

        // Reset totals
        document.getElementById('totalAmount').textContent = `₹${result.originalTotal}`;
        document.getElementById('discountAmount').textContent = '₹0';
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




document.getElementById('btnCheckout').addEventListener('click', async(e)=>{
  e.preventDefault();
  const totalAmount = document.getElementById('totalAmount').textContent.trim().replace('₹', '');
  const deliveryFee = document.getElementById('shippingFee').textContent.trim().replace('₹', '');
  const discount = document.getElementById('discountAmount').textContent.trim().replace('₹', '');
  const finalTotal = document.getElementById('finalTotal').textContent.trim().replace('₹', '');
  const appliedCoupon = document.getElementById('appliedCouponCode').textContent.trim();

  const checkOutData = {
    totalAmount: parseInt(totalAmount.replace(/,/g, ''), 10) || 0,
    deliveryFee: deliveryFee === 'Free' ? 0 : parseFloat(deliveryFee) || 0,
    discount: parseFloat(discount) || 0,
    finalTotal: parseInt(finalTotal.replace(/,/g, ''), 10) || 0,
    appliedCoupon: appliedCoupon || 'N/A',
  };
  console.log(checkOutData)

  try {
    const response = await fetch('/user/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkOutData),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('Order saved successfully:', result);
      window.location.href='/user/checkOut';
    } else {
      console.error('Error saving order:', result);
      alert('Failed to save the order. Please try again.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred while sending the order data.');
  }
  
})















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