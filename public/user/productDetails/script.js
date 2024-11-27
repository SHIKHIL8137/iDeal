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

function redirectToLogin() {
  window.location.href = "/user/login";
}


const descriptionBtn = document.getElementById("description-btn");
    const reviewBtn = document.getElementById("review-btn");
    const descriptionContent = document.getElementById("description-content");
    const reviewContent = document.getElementById("review-content");

    descriptionBtn.addEventListener("click", () => {
      // Set buttons
      descriptionBtn.classList.add("active");
      reviewBtn.classList.remove("active");

      // Toggle content
      descriptionContent.classList.add("active");
      reviewContent.classList.remove("active");
    });

    reviewBtn.addEventListener("click", () => {
      // Set buttons
      reviewBtn.classList.add("active");
      descriptionBtn.classList.remove("active");

      // Toggle content
      reviewContent.classList.add("active");
      descriptionContent.classList.remove("active");
    });



    document.addEventListener("DOMContentLoaded", function() {
      const productImage = document.getElementById("product-image");
      const zoomedImage = document.getElementById("zoomed-image");
    
      productImage.addEventListener("mousemove", function(e) {
          zoomedImage.style.display = "block";
    
          // Calculate the position of the cursor relative to the image
          const rect = productImage.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
    
          // Set the position of the zoomed field based on the cursor
          zoomedImage.style.left = `${x - zoomedImage.offsetWidth / 2}px`;
          zoomedImage.style.top = `${y - zoomedImage.offsetHeight / 2}px`;
    
          // Calculate background position for zoom effect
          const bgX = (x / rect.width) * 100;
          const bgY = (y / rect.height) * 100;
          zoomedImage.style.backgroundPosition = `${bgX}% ${bgY}%`;
      });
    
      productImage.addEventListener("mouseleave", function() {
          zoomedImage.style.display = "none"; // Hide the zoomed field when cursor leaves the image
      });
    
      // Set up the zoomed image background
      zoomedImage.style.backgroundImage = `url(${productImage.src})`;
      zoomedImage.style.backgroundSize = `${productImage.width * 2}px ${productImage.height * 2}px`; // Double size for zoom effect
    });


    function changeImage(imageSrc) {
      // Change the main product image
      document.getElementById('product-image').src = imageSrc;
      
      // Change the zoomed image (you can apply a zoom effect or show a large version)
      document.getElementById('zoomed-image').style.backgroundImage = `url('${imageSrc}')`;
    }
  
    // Set the default image on page load
    window.onload = function() {
      const defaultImage = document.querySelector('.thumbnail-images img').src;
      document.getElementById('product-image').src = defaultImage;
      
      // Set the default zoomed image as well
      document.getElementById('zoomed-image').style.backgroundImage = `url('${defaultImage}')`;
    }



    let quantity = 1;  // Initial quantity value
    const maxQuantity = 10;  // Maximum limit of 10
    const quantityValueElement = document.getElementById("quantityValue");
    const increaseBtn = document.getElementById("increaseBtn");
    const decreaseBtn = document.getElementById("decreaseBtn");
    function updateQuantityDisplay() {
      quantityValueElement.textContent = quantity.toString().padStart(2, '0');  // Ensure two digits
      decreaseBtn.disabled = (quantity <= 1);  // Disable '-' button if quantity is 1
      increaseBtn.disabled = (quantity >= maxQuantity);  // Disable '+' button if quantity is 10
    }

    // Event listener for increasing quantity
    increaseBtn.addEventListener("click", () => {
      if (quantity < maxQuantity) {
        quantity++;  // Increase quantity
        updateQuantityDisplay();  // Update the display
      }
    });

    // Event listener for decreasing quantity
    decreaseBtn.addEventListener("click", () => {
      if (quantity > 1) {
        quantity--;  // Decrease quantity
        updateQuantityDisplay();  // Update the display
      }
    });

    // Initialize the quantity display
    updateQuantityDisplay();
  

    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl)
})


document.getElementById('submitReviewButton').addEventListener('click', function() {
  const reviewText = document.getElementById('reviewText').value;
  const rating = document.getElementById('reviewRating').value;

  // Handle review submission, e.g., send data to server using AJAX
});






