let allCoupons = []; 
let filteredCoupons = []; 
let currentPage = 1;
const limit = 10; 
let debounceTimeout = null; 

document.addEventListener('DOMContentLoaded', () => {
  fetchCoupons();
  setFilterListeners(); 
  setSearchListener(); 
});


document.getElementById('addProductbtn').addEventListener('click',()=>{
  window.location.href = '/admin/addCoupon';
})

// Fetch all coupons once
function fetchCoupons() {
  fetch('/admin/coupon-data') 
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to fetch coupons');
      }
      return response.json();
    })
    .then((data) => {
      if (data.status === 'success') {
        allCoupons = data.coupons; 
        filteredCoupons = allCoupons; 
        renderPagination();
        renderCoupons();
      } else {
        alert('Error fetching coupon data:', data.message);
      }
    })
    .catch((error) => alert('Error:', error));
}

function renderCoupons() {
  const tableBody = document.getElementById('productTableBody');
  tableBody.innerHTML = '';

  const startIndex = (currentPage - 1) * limit;
  const endIndex = Math.min(startIndex + limit, filteredCoupons.length);

  const couponsToRender = filteredCoupons.slice(startIndex, endIndex);
if(filteredCoupons.length === 0){
  tableBody.innerHTML ='<tr><td colspan="9" class="text-center text-danger">No Coupon found.</td></tr>';
}
  
  couponsToRender.forEach((coupon) => {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${coupon.code}</td>
      <td>${coupon.discountPercentage}%</td>
      <td>₹${coupon.minOrderAmount || '-'}</td>
      <td>₹${coupon.maxDiscountAmount || '-'}</td>
      <td>${new Date(coupon.validFrom).toLocaleDateString('en-IN')}</td>
      <td>${new Date(coupon.validTill).toLocaleDateString('en-IN')}</td>
      <td>
        <span class="badge ${coupon.isActive ? 'bg-success' : 'bg-secondary'}">
          ${coupon.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td>${new Date(coupon.createdAt).toLocaleDateString('en-IN')}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary" onclick="editCoupon('${coupon._id}')">Edit</button>
      </td>
    `;

    tableBody.appendChild(row);
  });

  updatePaginationText(startIndex, endIndex);
}

// Render pagination controls
function renderPagination() {
  const totalPages = Math.ceil(filteredCoupons.length / limit);

  document.getElementById('prevPage').onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      renderPagination();
      renderCoupons();
    }
  };

  document.getElementById('nextPage').onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderPagination();
      renderCoupons();
    }
  };
}

function goToPage(page) {
  currentPage = page;
  renderPagination();
  renderCoupons();
}

function updatePaginationText(startIndex, endIndex) {
  const showingText = document.querySelector('.showing1-10Text');
  showingText.textContent = `Showing ${startIndex + 1}-${endIndex} from ${filteredCoupons.length}`;
}

function setFilterListeners() {
  const filterButtons = document.querySelectorAll('[data-filter]');
  const allFilterButton = document.querySelector('[data-filter="all"]');
  allFilterButton.classList.add('active');
  filterButtons.forEach((button) =>
    button.addEventListener('click', (e) => {
      const filter = e.target.getAttribute('data-filter');
      applyFilter(filter); 
      filterButtons.forEach((btn) => btn.classList.remove('active'));
      e.target.classList.add('active');
    })
  );
}

// Apply the selected filter
function applyFilter(filter) {
  if (filter === 'all') {
    filteredCoupons = allCoupons;
  } else if (filter === 'active') {
    filteredCoupons = allCoupons.filter((coupon) => coupon.isActive === true); 
  } else if (filter === 'expired') {
    filteredCoupons = allCoupons.filter((coupon) => coupon.isActive === false); 
  }

  currentPage = 1;
  renderPagination();
  renderCoupons();
}

// for searching
function setSearchListener() {
  const searchInput = document.querySelector('input[type="text"]'); 

  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimeout); 
    
    debounceTimeout = setTimeout(() => {
      const searchTerm = e.target.value; 
      fetchSearchResults(searchTerm); 
    }, 500); 
  });
}


function fetchSearchResults(searchTerm) {
  fetch(`/admin/search-coupons?search=${searchTerm}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.status === 'success') {
        filteredCoupons = data.coupons; 
        currentPage = 1; 
        renderPagination();
        renderCoupons();
      } else {
        alert('Error fetching search results:', data.message);
      }
    })
    .catch((error) => {
      alert('Error:', error);
    });
}

function editCoupon(couponId) {
  window.location.href = `/admin/editCoupon/${couponId}`;
}


// alert box
const alertBox = document.getElementById("alertBox");
alertBox.classList.add("show");
setTimeout(() => {
  alertBox.classList.remove("show");
  alertBox.classList.add("hide");
  setTimeout(() => {
    alertBox.style.display = "none";
  }, 500);
}, 3000);

// remove the params from url
if (window.location.search) {
  const url = window.location.origin + window.location.pathname;
  window.history.replaceState({}, document.title, url);
}
