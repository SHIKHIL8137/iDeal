
const rowsPerPage = 10; 
let currentPage = 1;
let products = JSON.parse(document.getElementById('userData').textContent); 

let productIdToDelete = null; 

// Function to render the product table
function renderTable() {
  const tableBody = document.getElementById('productTableBody');
  tableBody.innerHTML = ''; 
  if (products.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center">No products available.</td></tr>`;
    return;
  }

  // Sort products by 'createdAt' in descending order (newest first)
  products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, products.length);

  // Loop through the products for the current page
  for (let i = startIndex; i < endIndex; i++) {
    const val = products[i];
    const row = `
      <tr>
        <td>
          <img src="${val.images[0]}" alt="Product Image" class="me-2" style="width: 50px; height: 50px;" id="ProductImage">
          ${val.name}
        </td>
        <td>${val.category.name} Series</td>
        <td>${val.price}</td>
        <td>
          <span class="badge ${
            val.stock >= 10 ? 'bg-success' : val.stock > 0 ? 'bg-warning text-dark' : 'bg-danger'
          }">
            ${
              val.stock >= 10
                ? 'Published'
                : val.stock > 0
                ? 'Low Stock'
                : 'Out of Stock'
            }
          </span>
        </td>
        <td>${new Date(val.createdAt).toLocaleDateString('en-IN')}</td>
        <td>
          <button class="btn btn-sm btn-outline-secondary" onclick="showEdit('${val._id}')">Edit</button>
          <button class="btn btn-sm btn-outline-danger" onclick="showDeleteModal('${val._id}')">Delete</button>
        </td>
      </tr>
    `;
    tableBody.innerHTML += row;
  }

  document.querySelector('.showing1-10Text').textContent = `Showing ${startIndex + 1}-${endIndex} from ${products.length}`;
  updatePaginationButtons();
}


// Pagination logic to go to the next page
function goToNextPage() {
  if (currentPage * rowsPerPage < products.length) {
    currentPage++;
    renderTable();
  }
}

// Pagination logic to go to the previous page
function goToPrevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderTable();
  }
}

// Update pagination buttons (disable next/prev buttons based on the current page)
function updatePaginationButtons() {
  document.getElementById('prevPage').disabled = currentPage === 1;
  document.getElementById('nextPage').disabled = currentPage * rowsPerPage >= products.length;
}

// Show the modal to confirm product deletion
function showDeleteModal(productId) {
  productIdToDelete = productId; 
  const modal = new bootstrap.Modal(document.getElementById('deleteConfirmationModal'));
  modal.show(); 
}

// Event listener for the confirm delete button
document.getElementById('confirmDeleteButton').addEventListener('click', function () {
  if (productIdToDelete) {
    window.location.href = `/admin/deleteProduct/${productIdToDelete}`;
  }
});

// Redirect to the edit product page
function showEdit(productId) {
  if (productId) {
    window.location.href = `/admin/editProduct/${productId}`;
  }
}
renderTable();
// Event listeners for pagination buttons
document.getElementById('nextPage').addEventListener('click', goToNextPage);
document.getElementById('prevPage').addEventListener('click', goToPrevPage);

//redirect to category
document.getElementById('categorybtn').addEventListener('click',function(){

window.location.href=`/admin/category`

})

// redirect to addproduct
document.getElementById('addProductbtn').addEventListener('click',function(){
  window.location.href=`/admin/addProduct`
})

// Function to filter products by status
function filterProducts(filterType) {
  let filteredProducts;

  switch (filterType) {
    case 'all':
      filteredProducts = originalProducts; 
      break;
    case 'published':
      filteredProducts = originalProducts.filter(product => product.stock >= 10);
      break;
    case 'lowstock':
      filteredProducts = originalProducts.filter(product => product.stock > 0 && product.stock < 10);
      break;
    case 'outofstock':
      filteredProducts = originalProducts.filter(product => product.stock === 0);
      break;
    default:
      filteredProducts = originalProducts;
  }

  products = filteredProducts;
  currentPage = 1;
  renderTable();
}

// Add event listeners for filter buttons
document.querySelectorAll('.btn-outline-primary, .btn-outline-secondary, .btn-outline-warning, .btn-outline-danger')
  .forEach(button => {
    button.addEventListener('click', event => {
      document.querySelectorAll('.btn-outline-primary, .btn-outline-secondary, .btn-outline-warning, .btn-outline-danger')
        .forEach(btn => btn.classList.remove('active'));
      event.target.classList.add('active');
      const filterType = event.target.getAttribute('data-filter');
      filterProducts(filterType);
    });
  });
const originalProducts = [...products];
filterProducts('all');



// Search functionality
document.querySelector('.form-control').addEventListener('input', function (event) {
  const searchQuery = event.target.value.trim().toLowerCase();

  const filteredProducts = originalProducts.filter(product => {
    const nameMatch = product.name.toLowerCase().includes(searchQuery);
    const categoryMatch = product.category.name.toLowerCase().includes(searchQuery);
    return nameMatch || categoryMatch;
  });

  products = filteredProducts; 
  currentPage = 1; 
  renderTable(); 
});





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

// remove the params from the url
if (window.location.search) {
      const url = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, url);
    }


