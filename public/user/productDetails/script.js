
const product = JSON.parse(document.getElementById('productData').textContent);
const offer = JSON.parse(document.getElementById('offerData').textContent);
console.log(offer);

  const productScrollContainer = document.getElementById("scroll-container");
  const productScrollBack = document.getElementById("scroll-back");
  const productScrollForward = document.getElementById("scroll-forward");

  const categoryScrollContainer = document.getElementById("scroll-container-category");
  const categoryScrollBack = document.getElementById("scroll-backwardCategory");
  const categoryScrollForward = document.getElementById("scroll-forwardCategory");

  const scrollAmount = 300;

  if (productScrollContainer && productScrollBack && productScrollForward) {
    productScrollBack.addEventListener("click", () => {
      console.log('cliked')
      productScrollContainer.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    });
    productScrollForward.addEventListener("click", () => {
      productScrollContainer.scrollBy({ left: scrollAmount, behavior: "smooth" });
    });
  }

  if (categoryScrollContainer && categoryScrollBack && categoryScrollForward) {
    categoryScrollBack.addEventListener("click", () => {
      categoryScrollContainer.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    });
    categoryScrollForward.addEventListener("click", () => {
      categoryScrollContainer.scrollBy({ left: scrollAmount, behavior: "smooth" });
    });
  }



// DOMContentLoaded Main Wrapper
document.addEventListener("DOMContentLoaded", function () {

  //  Arrival Cards Click Event

  const productCards = document.querySelectorAll(".arrival-card");

  productCards.forEach((card) => {
    card.addEventListener("click", function (event) {
      event.preventDefault();
      console.log("Card clicked");
      const productId = this.dataset.productId;
      console.log("Product ID:", productId);

      if (productId) {
        window.location.href = `/user/productDetails/${productId}`;
      } else {
        console.error("Product ID is missing!");
      }
    });
  });


  //  Session Check and Message Display
  const navbar = document.getElementById("checkSession");
  const sessionCheck = navbar.dataset.sessionCheck === "true";
  console.log("Raw data-session-check:", navbar.dataset.sessionCheck);

  if (!sessionCheck) {
    setTimeout(() => {
      const loginMessage = document.getElementById("loginMessage");
      loginMessage.style.display = "block";
    }, 1000);
  }


  //  Tab Toggle for Description & Reviews
  const descriptionBtn = document.getElementById("description-btn");
  const reviewBtn = document.getElementById("review-btn");
  const descriptionContent = document.getElementById("description-content");
  const reviewContent = document.getElementById("review-content");

  if (descriptionBtn && reviewBtn) {
    descriptionBtn.addEventListener("click", () => {
      descriptionBtn.classList.add("active");
      reviewBtn.classList.remove("active");
      descriptionContent.classList.add("active");
      reviewContent.classList.remove("active");
    });

    reviewBtn.addEventListener("click", () => {
      reviewBtn.classList.add("active");
      descriptionBtn.classList.remove("active");
      reviewContent.classList.add("active");
      descriptionContent.classList.remove("active");
    });
  }


  //  Product Image Zoom Feature
  const productImage = document.getElementById("product-image");
  const zoomedImage = document.getElementById("zoomed-image");

  if (productImage && zoomedImage) {
    productImage.addEventListener("mousemove", function (e) {
      zoomedImage.style.display = "block";

      const rect = productImage.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      zoomedImage.style.left = `${x - zoomedImage.offsetWidth / 2}px`;
      zoomedImage.style.top = `${y - zoomedImage.offsetHeight / 2}px`;

      const bgX = (x / rect.width) * 100;
      const bgY = (y / rect.height) * 100;
      zoomedImage.style.backgroundPosition = `${bgX}% ${bgY}%`;
    });

    productImage.addEventListener("mouseleave", function () {
      zoomedImage.style.display = "none";
    });

    zoomedImage.style.backgroundImage = `url(${productImage.src})`;
    zoomedImage.style.backgroundSize = `${productImage.width * 2}px ${productImage.height * 2}px`;
  }

  //  Quantity Update Buttons
  let quantity = 1;
  const maxQuantity = 10;
  const quantityValueElement = document.getElementById("quantityValue");
  const increaseBtn = document.getElementById("increaseBtn");
  const decreaseBtn = document.getElementById("decreaseBtn");

  function updateQuantityDisplay() {
    quantityValueElement.textContent = quantity.toString().padStart(2, "0");
    decreaseBtn.disabled = quantity <= 1;
    increaseBtn.disabled = quantity >= maxQuantity;
  }

  if (quantityValueElement && increaseBtn && decreaseBtn) {
    increaseBtn.addEventListener("click", () => {
      if (quantity < maxQuantity) {
        quantity++;
        updateQuantityDisplay();
      }
    });

    decreaseBtn.addEventListener("click", () => {
      if (quantity > 1) {
        quantity--;
        updateQuantityDisplay();
      }
    });

    updateQuantityDisplay();
  }


  //  Tooltip Initialization

  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

});

function changeImage(imageSrc) {
  document.getElementById('product-image').src = imageSrc;
  document.getElementById('zoomed-image').style.backgroundImage = `url('${imageSrc}')`;
}
window.onload = function() {
  const defaultImage = document.querySelector('.thumbnail-images img').src;
  document.getElementById('product-image').src = defaultImage;
  document.getElementById('zoomed-image').style.backgroundImage = `url('${defaultImage}')`;
}
function redirectToLogin() {
  window.location.href = "/user/login";
}


// addto product to the cart



document.getElementById('addTocartProduct').addEventListener('click', async () => {
const productId = product._id;
let price;
let actualPrice;
console.log(offer);
if(product.offer) {
 price = (product.price - (product.price * (offer.discountValue / 100)));
 actualPrice = product.Dprice
}else{
 price = product.Dprice;
 actualPrice = product.Dprice;
}

  if (!productId) {
    showAlert('Product ID is missing. Unable to add to cart.', 'danger');
    return;
  }

  const datatoSet = { productId ,price , actualPrice};

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
});


async function addToWishlist(productId) {
  try {
    const response = await fetch(`/user/addToWishlist/${productId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    console.log(result.status)
    if (result.status) {
      showAlert(result.message || "Product added to wishlist",'success');
    } else {
      console.log('else');
      showAlert(result.message || "Failed to add product to wishlist",'danger');
    }
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    showAlert("An error occurred while adding the product to the wishlist.",'danger');
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

