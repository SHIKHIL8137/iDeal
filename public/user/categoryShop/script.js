
// check the seesion to hide and unhide the login popup
document.addEventListener("DOMContentLoaded", function () {
  const navbar = document.getElementById('checkSession');
  const sessionCheck = navbar.dataset.sessionCheck === 'true'; 
  console.log('Raw data-session-check:', navbar.dataset.sessionCheck);
  if(!sessionCheck){
    setTimeout(() => {
      const loginMessage = document.getElementById("loginMessage");
      loginMessage.style.display = "block";
    }, 1000); 
  }

});

// redirect to login page
function redirectToLogin() {
  window.location.href = "/user/login";
}


// updated price
function updatePriceLabel() {
  const priceValue = document.getElementById('priceRange').value;
  document.getElementById('priceValue').innerText = `₹${priceValue}`;
}

//filter actions
function applyFilters() {
  const selectedPrice = document.getElementById('priceRange').value;
  const selectedColors = Array.from(document.querySelectorAll('.color-checkbox:checked')).map(cb => cb.value);
  const selectedStorage = Array.from(document.querySelectorAll('.storage-checkbox:checked')).map(cb => cb.value);
  const selectedConnectivity = Array.from(document.querySelectorAll('.connectivity-checkbox:checked')).map(cb => cb.value);

  const productCards = document.querySelectorAll('.product-card');
  productCards.forEach(card => {
    const productColor = card.getAttribute('data-color');
    const productStorage = card.getAttribute('data-storage');
    const productConnectivity = card.getAttribute('data-connectivity');
    const productPrice = 30000; // Example price, replace with actual data if available

    const isColorMatch = selectedColors.length === 0 || selectedColors.includes(productColor);
    const isStorageMatch = selectedStorage.length === 0 || selectedStorage.includes(productStorage);
    const isConnectivityMatch = selectedConnectivity.length === 0 || selectedConnectivity.includes(productConnectivity);
    const isPriceMatch = productPrice <= selectedPrice;

    if (isColorMatch && isStorageMatch && isConnectivityMatch && isPriceMatch) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

// whish list heart action
function toggleHeart(element) {
  if (element.classList.contains("bi-heart")) {
    element.classList.remove("bi-heart");
    element.classList.add("bi-heart-fill", "filled");
  } else {
    element.classList.remove("bi-heart-fill", "filled");
    element.classList.add("bi-heart");
  }
}




  // Enable tooltips
  var tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
  })


document.addEventListener('DOMContentLoaded', function() {
  // Select all product cards using a class (or by id if you're using unique ids)
  const productCards = document.querySelectorAll('.product-card');
  
  productCards.forEach(card => {
    card.addEventListener('click', function() {
      const productId = this.dataset.productId;
      window.location.href = `/user/productDetails/${productId}`;
    });
  });
});


