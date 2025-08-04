

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


document.addEventListener('DOMContentLoaded',getWishlistData());
const offer = JSON.parse(document.getElementById('offerData').textContent);


async function deleteFromWishlist(productId) {
  try {
    const response = await fetch(`/user/deleteFromWishlist/${productId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (result.status) {
      showAlert(result.message || "Item removed from wishlist",'success');
      getWishlistData()
    } else {
      showAlert(result.message || "Failed to remove item from wishlist",'danger');
    }
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    showAlert("An error occurred while removing the item from the wishlist.",'danger');
  }
}





async function addtoCart(buttonElement) {
  const productDataJson = buttonElement.getAttribute('data-product'); 
  const product = JSON.parse(productDataJson);
  const productId = product._id;

  const offerProduct = offer.filter((val) => val.product === productId);
  const discountValue = offerProduct.length > 0 ? offerProduct[0].discountValue : 0;
  const price = product.offer 
    ? product.price - (product.price * (discountValue / 100)) 
    : product.Dprice;
  const actualPrice = product.Dprice;

  const datatoSet = { productId, price, actualPrice };

  buttonElement.disabled = true;
  buttonElement.innerText = 'Adding...';

  try {
    const response = await fetch('/user/addtoCartProduct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datatoSet),
    });

    const result = await response.json();

    if (response.ok) {
      showAlert(result.message, 'success');
      getCartCount()
    } else {
      showAlert(result.message || 'Failed to add product to cart. Please try again.', 'danger');
    }
  } catch (error) {
    console.error('Error:', error);
    showAlert('An error occurred while adding the product to cart. Please try again.', 'danger');
  } finally {
    buttonElement.disabled = false;
    buttonElement.innerText = 'Add to Cart';
  }
}


async function getWishlistData() {
  try {
    const response = await fetch('/user/getWishListData', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (response.ok) {
      const data = await response.json();
      renderTable(data.wishlist); 
    } else {
      console.error('Failed to fetch wishlist data:', response.status);
    }
  } catch (error) {
    console.error('Error fetching wishlist data:', error);
  }
}

function renderTable(wishlist) {
  const wishlistContainer = document.querySelector('.content tbody');
  wishlistContainer.innerHTML = ''; 
  if (wishlist.length > 0) {
    wishlist.forEach(item => {
      let productOffer = offer.filter((val) => val.product === item.productId._id);
      let discountValue = productOffer.length > 0 ? productOffer[0].discountValue : 0;
      let discountedPrice = item.productId.price - (item.productId.price * (discountValue / 100));
      const row = `
        <tr>
          <td>
            <div class="d-flex align-items-center">
              <img src="${item.productId.images[0]}" alt="${item.productId.name}" class="me-3" width="50" height="50" style="object-fit: contain;">
              <div class="d-flex flex-column">
                <strong><a href="/productDetails/${item.productId._id}" style="text-decoration: none; color : white">${item.productId.name}</a></strong>
                <small>${item.productId.storage}GB(${item.productId.color})</small>
              </div>
            </div>
          </td>
          <td>
            <span class="text-white">
              <del style="font-size: 13px;">₹${item.productId.price.toLocaleString()}</del> 
              ₹${item.productId.offer ? discountedPrice.toLocaleString() : item.productId.Dprice.toLocaleString()}
            </span>
          </td>
          <td>${item.productId.condition}</td>
          <td>
            <span class="${item.productId.stock > 0 ? 'in-stock' : 'out-of-stock'}">
              ${item.productId.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </td>
          <td>
            <div class="tableAddToCartDiv">
              <button id="addTocartProduct" data-product='${JSON.stringify(item.productId).replace(/'/g, '&#39;')}' onclick="addtoCart(this)" class="btn btn-primary btn-sm" ${item.productId.stock > 0 ? '' : 'disabled'}>Add to Cart</button>
              <button class="btn-remove" onclick="deleteFromWishlist('${item.productId._id}')">&times;</button>
            </div>
          </td>
        </tr>
      `;
      wishlistContainer.insertAdjacentHTML('beforeend', row);
    });
  } else {
    wishlistContainer.innerHTML = '<p>Your wishlist is empty. Start adding products to your wishlist!</p>';
  }
}









function showAlert(message, type) {
  const alertBox = document.getElementById('alertBox');
  if (!alertBox) {
    console.error('Alert box element not found!');
    return;
  }

  alertBox.innerHTML = message;
  alertBox.className = `alert alert-${type} show`;


  const timeout = Math.max(3000, message.length * 100); 
  setTimeout(() => {
    alertBox.className = `alert alert-${type} hide`;
  }, timeout);
}