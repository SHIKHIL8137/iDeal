document.addEventListener('DOMContentLoaded',()=>{
  getCartData();
  getCartSummary();
})

async function removeFromCart(productId) {
  try {
    const response = await fetch('/user/removeFromCart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    });

    const result = await response.json();
    if (response.ok) {
      getCartData();
  getCartSummary();
      showAlert('Product remove successFully','success')
    } else {
    showAlert('Errror removing item','danger')
    }
  } catch (error) {
    console.error('Error removing item:', error);
  }
}

async function updateQuantity(productId, action) {
  try {
    const response = await fetch('/user/updateCartQuantity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, action }),
    });

    const result = await response.json();
    console.log(result);
    if (response.ok) {
      getCartData();
  getCartSummary();
    } else {
      showAlert(result.message,'danger')
    }
  } catch (error) {
    console.error('Error updating quantity:', error);
  }
}



document.getElementById('btnCheckout').addEventListener('click', async (e) => {
  e.preventDefault();

  // Fetch data from the cart summary
  const totalAmount = parseFloat(
    document.getElementById('totalAmount').textContent.trim().replace('₹', '').replace(/,/g, '')
  );
  const shippingFeeText = document.getElementById('shippingFee').textContent.trim();
  const deliveryFee = shippingFeeText === 'Free' ? 0 : parseFloat(shippingFeeText.replace('₹', '').replace(/,/g, ''));
  const finalTotal = parseFloat(
    document.getElementById('finalTotal').textContent.trim().replace('₹', '').replace(/,/g, '')
  );
  const categoryDiscountText = document.getElementById('categoryDiscound');
  const categoryDiscount = categoryDiscountText
    ? parseFloat(categoryDiscountText.textContent.trim().replace('₹', '').replace(/,/g, '')) || 0
    : 0;
 
  // Prepare the checkout data
  const checkOutData = {
    totalAmount,
    deliveryFee,
    finalTotal,
    categoryDiscount,
  };

console.log(checkOutData);


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
      window.location.href = `/user/checkOut`;
    } else {
      console.error('Error saving order:', result);
      alert('Failed to save the order. Please try again.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred while sending the order data.');
  }
});


async function getCartData() {
  try {
    const response = await fetch('/user/getCartDetails', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch cart details');
    }

    const result = await response.json();

    if (result.status) {
      const userCart = result.data.userCart;
      renderCart(userCart); 
    } else {
      showAlert('Error fetching cart data', 'warning');
    }
  } catch (error) {
    console.error('Error:', error);
    showAlert('Internal Server Error', 'danger');
  }
}

function renderCart(userCart) {
  const cartContainer = document.querySelector('.col-md-8'); 

  if (!userCart || userCart.items.length === 0) {
    cartContainer.innerHTML = `<p>Your cart is empty.</p>`;
    return;
  }

  let cartHTML = '';

  userCart.items.forEach((item) => {
    cartHTML += `
      <div class="card mb-3">
        <div class="card-body d-flex align-items-center justify-content-between">
          <!-- Product Info -->
          <div class="d-flex align-items-center cartItemdivRight" style="max-width:250px; width: 100%;">
            <img src="${item.productId.images[0]}" alt="${item.productId.name}" class="me-3"
              style="width: 60px; height: 60px; object-fit: contain;">
            <div>
              <h6 class="mb-1"><a href="/productDetails/${item.productId._id}" style="text-decoration: none; color : black">${item.productId.name}</a></h6>
              <small class="text-muted">Price: ₹${item.price.toLocaleString()}</small>
            </div>
          </div>
          <div>
            <small class="text-muted">₹${item.totalPrice.toLocaleString()}</small>
          </div>

          <!-- Quantity Controls -->
          <div class="input-group input-group-sm w-auto">
            <button class="btn btn-outline-dark" type="button"
              onclick="updateQuantity('${item.productId._id}', 'decrement')">-</button>
            <input type="text" class="form-control text-center no-focus" value="${item.quantity}"
              style="max-width: 50px;" readonly>
            <button class="btn btn-outline-dark" type="button"
              onclick="updateQuantity('${item.productId._id}', 'increment')">+</button>
          </div>

          <!-- Remove Button -->
          <button class="btn btn-outline-danger btn-sm"
            onclick="removeFromCart('${item.productId._id}')">&times;</button>
        </div>
      </div>
    `;
  });

  cartContainer.innerHTML = cartHTML;
}


// Fetch cart summary data from the server
async function getCartSummary() {
  try {
    const response = await fetch('/user/cartSummary', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch cart summary');
    }

    const result = await response.json();

    if (result.status) {
      const { userCart, discountCategoryOffer, totalCategoryDiscount } = result.data;
      updateCartSummary(userCart, discountCategoryOffer, totalCategoryDiscount);
    } else {
      showAlert(result.message || 'Error fetching cart summary', 'warning');
    }
  } catch (error) {
    console.error('Error:', error);
    showAlert('Internal Server Error', 'danger');
  }
}

// Update cart summary details in the DOM
function updateCartSummary(userCart, discountCategoryOffer, totalCategoryDiscount) {
  const totalAmountElement = document.getElementById('totalAmount');
  const shippingFeeElement = document.getElementById('shippingFee');
  const categoryDiscountElement = document.getElementById('categoryDiscound');
  const finalTotalElement = document.getElementById('finalTotal');
  const btnCheckout = document.getElementById('btnCheckout');

  // Calculate totals
  const totalAmount = userCart.totalAmount || 0;
  const shippingFee = totalAmount > 5000 ? 0 : 40;
  const finalTotal = totalAmount - totalCategoryDiscount + shippingFee;

  // Update DOM elements
  totalAmountElement.textContent = `₹${totalAmount.toLocaleString()}`;
  shippingFeeElement.textContent = shippingFee === 0 ? 'Free' : `₹${shippingFee}`;
  categoryDiscountElement.textContent = `₹${totalCategoryDiscount.toLocaleString()}`;
  finalTotalElement.textContent = `₹${finalTotal.toLocaleString()}`;

  // Enable or disable the checkout button
  if (totalAmount <= 0) {
    btnCheckout.setAttribute('disabled', 'disabled');
  } else {
    btnCheckout.removeAttribute('disabled');
  }
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