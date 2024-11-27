
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

document.addEventListener("DOMContentLoaded", () => {
  // New Arrivals Scroll
  const productScrollContainer = document.getElementById("scroll-container");
  const productScrollBack = document.getElementById("scroll-back");
  const productScrollForward = document.getElementById("scroll-forward");

  const categoryScrollContainer = document.getElementById("scroll-container-category");
  const categoryScrollBack = document.getElementById("scroll-backwardCategory");
  const categoryScrollForward = document.getElementById("scroll-forwardCategory");

  const scrollAmount = 300; 

  // Scroll functions for products
  productScrollBack.addEventListener("click", () => {
    productScrollContainer.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  });
  productScrollForward.addEventListener("click", () => {
    productScrollContainer.scrollBy({ left: scrollAmount, behavior: "smooth" });
  });

  // Scroll functions for categories
  categoryScrollBack.addEventListener("click", () => {
    categoryScrollContainer.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  });
  categoryScrollForward.addEventListener("click", () => {
    categoryScrollContainer.scrollBy({ left: scrollAmount, behavior: "smooth" });
  });
});



document.addEventListener('DOMContentLoaded', function() {
  // Select all category cards using the class
  const categoryCards = document.querySelectorAll('.category-card');
  
  categoryCards.forEach(card => {
    card.addEventListener('click', function() {
      const categoryId = this.dataset.categoryId; 
      console.log(categoryId)
      window.location.href = `/user/categoryShop/${categoryId}`; 
    });
  });
});



document.addEventListener('DOMContentLoaded', function() {
  const productCards = document.querySelectorAll('.arrival-card');
  
  productCards.forEach(card => {
    card.addEventListener('click', function(event) {
      event.preventDefault();  // Prevent default behavior of the click
      const productId = this.dataset.productId;  // Use productId, not categoryId
      console.log(productId);  // Check the productId value
      if (productId) {
        window.location.href = `/user/productDetails/${productId}`;
      } else {
        console.error('Product ID is missing!');
      }
    });
  });
});






if (window.location.search) {
  const url = window.location.origin + window.location.pathname;
  window.history.replaceState({}, document.title, url);
}