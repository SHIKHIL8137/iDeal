// check the session an hide and unhide the login button
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

},fetchBanners());

// redirect to login page
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
      window.location.href = `/categoryShop/${categoryId}`; 
    });
  });
});


// reditrect to product details page 
document.addEventListener('DOMContentLoaded', function() {
  const productCards = document.querySelectorAll('.arrival-card');
  
  productCards.forEach(card => {
    card.addEventListener('click', function(event) {
      event.preventDefault();  
      const productId = this.dataset.productId; 
      console.log(productId);  
      if (productId) {
        window.location.href = `/productDetails/${productId}`;
      } else {
        console.error('Product ID is missing!');
      }
    });
  });
});


async function fetchBanners() {
  try {
      const response = await fetch('/user/getbanners');
      const data = await response.json();

      if (response.ok && data.success) {
          const { home_image, offer_banner } = data.data;

          if (home_image) {
            document.querySelector('.main-banner').style.backgroundImage = `url(${home_image})`;
          }
          if (offer_banner) {
            document.querySelector('.promo-banner').style.backgroundImage = `url(${offer_banner})`;
          }
      } else {
          console.error('Failed to fetch banners:', data.error || 'Unknown error');
      }
  } catch (error) {
      console.error('Error fetching banners:', error);
  }
}



if (window.location.search) {
  const url = window.location.origin + window.location.pathname;
  window.history.replaceState({}, document.title, url);
}