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

    }
  } catch (error) {
    console.error('Error removing item:', error);
  }
}

function applyCoupon() {
  const couponCode = document.getElementById('coupon').value;

  fetch('/user/applyCoupon', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ coupon: couponCode }),
  })
  .then(response => response.json())
  .then(result => {
    if (result.success) {
      // Update UI with the new total and discount message
      alert(result.message);
      location.reload(); // Reload the page to reflect updated cart details
    } else {
      alert(result.message);
    }
  })
  .catch(error => {
    console.error('Error applying coupon:', error);
    alert('Failed to apply coupon.');
  });
}

