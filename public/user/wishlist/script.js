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
      setTimeout(()=>{
        window.location.reload()
      },4000)
    } else {
      showAlert(result.message || "Failed to remove item from wishlist",'danger');
    }
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    showAlert("An error occurred while removing the item from the wishlist.",'danger');
  }
}





async function addtoCart(productId ,price){


  const datatoSet = { productId ,price};
  const button = document.getElementById('addTocartProduct');
    button.disabled = true; 
    button.innerText = 'Adding...';
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
    } else {
      showAlert(result.message || 'Failed to add product to cart. Please try again.', 'danger');
    }
  } catch (error) {
    console.error('Error:', error);
    showAlert('Failed to add product to cart. Please try again.', 'danger');
  } finally {
    button.disabled = false; 
    button.innerText = 'Add to Cart';
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