// check the session and hide and unhide the button
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

// redirect to login
function redirectToLogin() {
  window.location.href = "/user/login";
}

// updata pric tag
function updatePriceLabel() {
  const priceValue = document.getElementById('priceRange').value;
  document.getElementById('priceValue').innerText = `₹${priceValue}`;
}





// Initialize all tooltips
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl)
})




document.addEventListener('DOMContentLoaded', function() {
  const productCards = document.querySelectorAll('.product-card');
  
  productCards.forEach(card => {
    card.addEventListener('click', function(event) {
      event.preventDefault();  
      const productId = this.dataset.productId;  
      console.log(productId); 
      if (productId) {
        window.location.href = `/user/productDetails/${productId}`;
      } else {
        console.error('Product ID is missing!');
      }
    });
  });
});




function toggleHeart(element, productId) {
  if (element.classList.contains("bi-heart")) {
    element.classList.remove("bi-heart");
    element.classList.add("bi-heart-fill", "filled");

    addToWishlist(productId, element); 
  } else {
    element.classList.remove("bi-heart-fill", "filled");
    element.classList.add("bi-heart");

    removeFromWishlist(productId, element); 
  }
}

async function addToWishlist(productId, element) {
  try {
    const response = await fetch(`/user/addToWishlist/${productId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    if (result.status) {
      showAlert(result.message || "Product added to wishlist", "success");
    } else {
      showAlert(result.message || "Failed to add product to wishlist", "danger");

      element.classList.remove("bi-heart-fill", "filled");
      element.classList.add("bi-heart");
    }
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    showAlert("An error occurred while adding the product to the wishlist.", "danger");

    element.classList.remove("bi-heart-fill", "filled");
    element.classList.add("bi-heart");
  }
}

//  Remove from wishlist 
async function removeFromWishlist(productId, element) {
  try {
    const response = await fetch(`/user/deleteFromWishlist/${productId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    if (result.status) {
      showAlert(result.message || "Product removed from wishlist", "success");
    } else {
      showAlert(result.message || "Failed to remove product from wishlist", "danger");
      element.classList.remove("bi-heart");
      element.classList.add("bi-heart-fill", "filled");
    }
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    showAlert("An error occurred while removing the product from the wishlist.", "danger");

    element.classList.remove("bi-heart");
    element.classList.add("bi-heart-fill", "filled");
  }
}



// product searching
document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById('searchInput');
  const productList = document.getElementById('product-list');
  let debounceTimeout = null;


  searchInput.addEventListener('input', function () {
    const query = searchInput.value.trim();


    clearTimeout(debounceTimeout);


    debounceTimeout = setTimeout(function () {
      if (query.length > 0) {
        fetchProducts(query); 
      } else {
       location.reload()
      }
    }, 500); 
  });


  function fetchProducts(query) {
    fetch(`/user/search?search=${query}`)
      .then(response => response.json())
      .then(data => {

        productList.innerHTML = '';


        if (data.products.length > 0) {

          data.products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('card', 'h-100', 'shadow', 'arrival-card', 'm-2');
            productCard.style.minWidth = '200px';
            productCard.style.maxWidth = '250px';
            productCard.innerHTML = `
              <div class="image-container position-relative m-4">
                <img src="${product.images[0]}" class="card-img-top img-fluid" alt="${product.name}">
                <i class="bi bi-heart heart-icon" onclick="toggleHeart(this,'${product._id}')"></i>
              </div>
              <div class="card-body text-start product-card" data-product-id="${product._id}">
                <h6 class="card-title mb-1">${product.name}</h6>
                <p class="text-muted mb-1 cardPrice">
                  Storage: <strong>${product.storage >= 1000 ? (product.storage / 1024).toFixed(2) + ' TB' : product.storage + ' GB'}</strong>
                </p>
                <p class="text-success fw-bold mb-0 cardPrice">Price: ₹${product.price}</p>
                <p class="text-muted mb-0">
                  <!-- Dynamic Star Rating -->
                  ${product.reviews.length > 0 ? 
                    `<span class="rating-stars filled-star" data-bs-toggle="tooltip" title="${(product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length).toFixed(1)} stars">
                      ${'★'.repeat(Math.round(product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length))}
                      ${'☆'.repeat(5 - Math.round(product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length))}
                    </span>` 
                    : `<span class="rating-stars empty-star" data-bs-toggle="tooltip" title="No reviews yet">${'☆'.repeat(5)}</span>`
                  }
                  (<span data-bs-toggle="tooltip" title="Total reviews">${product.reviews.length || 0}</span> reviews)
                </p>
              </div>
            `;
            productList.appendChild(productCard);  
            
          });

          const productCards = document.querySelectorAll('.product-card');
  
          productCards.forEach(card => {
            card.addEventListener('click', function(event) {
              event.preventDefault(); 
              const productId = this.dataset.productId;  
              console.log(productId); 
              if (productId) {
                window.location.href = `/user/productDetails/${productId}`;
              } else {
                console.error('Product ID is missing!');
              }
            });
          });


        } else {
          productList.innerHTML = '<p>No products found!</p>';
        }
      })
      .catch(err => {
        console.error('Error fetching products:', err);
        productList.innerHTML = '<p>There was an error fetching the products.</p>';
      });
  }
});


//Product fillter by price order

async function sortProduct(order) {
  try {
    const response = await fetch(`/user/sortProduct?order=${order}`);
    if (!response.ok) throw new Error(`Product not found! Status: ${response.status}`);

    const data = await response.json();
    const products = data.products || [];

    const productList = document.getElementById('product-list');
    productList.innerHTML = ''; 
    products.forEach(product => {
      const averageRating = product.reviews.length > 0 
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0; 

      const productCard = document.createElement('div');
      productCard.classList.add('card', 'h-100', 'shadow', 'arrival-card', 'm-2');
      productCard.style.minWidth = '200px';
      productCard.style.maxWidth = '250px';
      productCard.innerHTML = `
        <div class="image-container position-relative m-4">
          <img src="${product.images[0]}" class="card-img-top img-fluid" alt="${product.name}">
          <i class="bi bi-heart heart-icon" onclick="toggleHeart(this,'${product._id}"></i>
        </div>
        <div class="card-body text-start product-card" data-product-id="${product._id}">
          <h6 class="card-title mb-1">${product.name}</h6>
          <p class="text-muted mb-1 cardPrice">
            Storage: <strong>${product.storage >= 1000 ? (product.storage / 1024).toFixed(2) + ' TB' : product.storage + ' GB'}</strong>
          </p>
          <p class="text-success fw-bold mb-0 cardPrice">Price: ₹${product.price}</p>
          <p class="text-muted mb-0">
            <!-- Dynamic Star Rating -->
            ${product.reviews.length > 0 
              ? `<span class="rating-stars filled-star" data-bs-toggle="tooltip" title="${averageRating.toFixed(1)} stars">
                  ${'★'.repeat(Math.round(averageRating))}
                  ${'☆'.repeat(5 - Math.round(averageRating))}
                </span>`
              : `<span class="rating-stars empty-star" data-bs-toggle="tooltip" title="No reviews yet">${'☆'.repeat(5)}</span>`
            }
            (<span data-bs-toggle="tooltip" title="Total reviews">${product.reviews.length || 0}</span> reviews)
          </p>
        </div>
      `;
      productList.appendChild(productCard);
    });

    const productCards = document.querySelectorAll('.product-card');
  
  productCards.forEach(card => {
    card.addEventListener('click', function(event) {
      event.preventDefault(); 
      const productId = this.dataset.productId;  
      console.log(productId); 
      if (productId) {
        window.location.href = `/user/productDetails/${productId}`;
      } else {
        console.error('Product ID is missing!');
      }
    });
  });
    
  } catch (error) {
    console.error('Failed to fetch product details:', error);
  }
}


// product filtering

async function applyFilters() {
  let priceRange = document.getElementById('priceRange').value;
  let storageValues = Array.from(document.querySelectorAll('.storage-checkbox:checked')).map(e => e.value);
  let connectivityValues = Array.from(document.querySelectorAll('.connectivity-checkbox:checked')).map(e => e.value);
  let ratingValues = Array.from(document.querySelectorAll('.rating-checkbox:checked')).map(e => e.value);
  let conditionValue = Array.from(document.querySelectorAll('.condition-checkbox:checked')).map(e => e.value);


  let filterData = {
    price: priceRange || null, 
    storage: storageValues.length > 0 ? storageValues : null, 
    connectivity: connectivityValues.length > 0 ? connectivityValues : null,
    rating: ratingValues.length > 0 ? ratingValues : null,
    condition: conditionValue.length > 0 ? conditionValue : null
  };
  

  try {
    const response = await fetch(`/user/filterProducts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(filterData)
    });

    if (!response.ok) throw new Error("Failed to fetch filtered products");

    const products = await response.json();

    const productList = document.getElementById("product-list");
    productList.innerHTML = ""; 

    products.forEach((product) => {
      const averageRating =
        product.reviews.length > 0
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
          : 0;

      const productCard = document.createElement("div");
      productCard.classList.add("card", "h-100", "shadow", "arrival-card", "m-2");
      productCard.style.minWidth = "200px";
      productCard.style.maxWidth = "250px";

      productCard.innerHTML = `
      <div class="image-container position-relative m-4">
        <img src="${product.images && product.images[0] ? product.images[0] : 'fallback-image-url.jpg'}"
             class="card-img-top img-fluid" alt="${product.name || 'Product'}">
        <i class="bi bi-heart heart-icon" onclick="toggleHeart(this,'${product._id}"></i>
      </div>
      <div class="card-body text-start product-card" data-product-id="${product._id}">
        <h6 class="card-title mb-1">${product.name || 'Unnamed Product'}</h6>
        <p class="text-muted mb-1 cardPrice">
          Storage: <strong>${product.storage >= 1000 ? (product.storage / 1024).toFixed(2) + ' TB' : product.storage + ' GB'}</strong>
        </p>
        <p class="text-success fw-bold mb-0 cardPrice">Price: ₹${product.price || 'N/A'}</p>
        <p class="text-muted mb-0">
          ${product.reviews.length > 0 
            ? `<span class="rating-stars filled-star" data-bs-toggle="tooltip" title="${averageRating.toFixed(1)} stars">
                ${'★'.repeat(Math.round(averageRating))}
                ${'☆'.repeat(5 - Math.round(averageRating))}
              </span>`
            : `<span class="rating-stars empty-star" data-bs-toggle="tooltip" title="No reviews yet">${'☆'.repeat(5)}</span>`}
          (<span data-bs-toggle="tooltip" title="Total reviews">${product.reviews.length || 0}</span> reviews)
        </p>
      </div>
    `;
      productList.appendChild(productCard);
    });

    const productCards = document.querySelectorAll('.product-card');
  
  productCards.forEach(card => {
    card.addEventListener('click', function(event) {
      event.preventDefault(); 
      const productId = this.dataset.productId; 
      console.log(productId);  
      if (productId) {
        window.location.href = `/user/productDetails/${productId}`;
      } else {
        console.error('Product ID is missing!');
      }
    });
  });

    // Initialize Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
      new bootstrap.Tooltip(tooltipTriggerEl);
    });

  } catch (error) {
    console.error("Error applying filters:", error);
  }
}
