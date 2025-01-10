const queryParams = new URLSearchParams(window.location.search);
const message = queryParams.get('message');

document.addEventListener('DOMContentLoaded', () => {
  getProductData();  
  if(message){
    showAlert(message,'success');
  }
  filterProducts('all');
  document.querySelector('[data-filter="all"]').classList.add('active');
});

const rowsPerPage = 10;
let currentPage = 1;
let products = [];
let originalProducts = [];

async function getProductData() {
  try {
    const response = await fetch('/admin/getTheProductDetails');
    if (!response.ok) throw new Error('Failed to fetch product details.');
    const result = await response.json();

    if (result.status) {
      products = result.products;
      originalProducts = [...products]; 
      renderTable(products);
      filterProducts('all');
    } else {
      showAlert('Error fetching products.', 'danger');
    }
  } catch (error) {
    showAlert('Error fetching the product data', 'danger');
    console.error(error);
  }
}

function renderTable(products) {
  const tableBody = document.getElementById('productTableBody');
  tableBody.innerHTML = '';
  if (products.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center">No products available.</td></tr>`;
    return;
  }

  products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, products.length);

  for (let i = startIndex; i < endIndex; i++) {
    const val = products[i];
    const row = `
      <tr>
        <td>
          <img src="${val.images[0]}" alt="Product Image" class="me-2" style="width: 50px; height: 50px;">
          ${val.name}
        </td>
        <td>${val.category.name} Series</td>
        <td>${val.price}</td>
        <td>
          <span class="badge ${
            val.stock >= 10 ? 'bg-success' : val.stock > 0 ? 'bg-warning text-dark' : 'bg-danger'
          }">
            ${val.stock >= 10 ? 'Published' : val.stock > 0 ? 'Low Stock' : 'Out of Stock'}
          </span>
        </td>
        <td>${new Date(val.createdAt).toLocaleDateString('en-IN')}</td>
        <td>
          <button class="btn btn-sm btn-outline-secondary" onclick="showEdit('${val._id}')">Edit</button>
        </td>
      </tr>
    `;
    tableBody.innerHTML += row;
  }

  document.querySelector('.showing1-10Text').textContent = `Showing ${startIndex + 1}-${endIndex} of ${products.length}`;
  updatePaginationButtons();
}

function goToNextPage() {
  if (currentPage * rowsPerPage < products.length) {
    currentPage++;
    renderTable(products);
  }
}

function goToPrevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderTable(products);
  }
}

function updatePaginationButtons() {
  document.getElementById('prevPage').disabled = currentPage === 1;
  document.getElementById('nextPage').disabled = currentPage * rowsPerPage >= products.length;
}

function filterProducts(filterType) {
  switch (filterType) {
    case 'all':
      products = [...originalProducts];
      break;
    case 'published':
      products = originalProducts.filter(product => product.stock >= 10);
      break;
    case 'lowstock':
      products = originalProducts.filter(product => product.stock > 0 && product.stock < 10);
      break;
    case 'outofstock':
      products = originalProducts.filter(product => product.stock === 0);
      break;
  }
  currentPage = 1;
  renderTable(products);
}

document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', event => {
    document.querySelectorAll('[data-filter]').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    const filterType = event.target.getAttribute('data-filter');
    filterProducts(filterType);
  });
});

document.querySelector('.form-control').addEventListener('input', event => {
  const searchQuery = event.target.value.trim().toLowerCase();
  products = originalProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery) || product.category.name.toLowerCase().includes(searchQuery)
  );
  currentPage = 1;
  renderTable(products);
});

document.getElementById('nextPage').addEventListener('click', goToNextPage);
document.getElementById('prevPage').addEventListener('click', goToPrevPage);

document.getElementById('categorybtn').addEventListener('click',function(){

  window.location.href=`/admin/category`
  
  })
  
  document.getElementById('addProductbtn').addEventListener('click',function(){
    window.location.href=`/admin/addProduct`
  });


  function showDeleteModal(productId) {
    productIdToDelete = productId; 
    const modal = new bootstrap.Modal(document.getElementById('deleteConfirmationModal'));
    modal.show(); 
  }
  
  document.getElementById('confirmDeleteButton').addEventListener('click', async function () {
    if (productIdToDelete) {
      const modalElement = document.getElementById('deleteConfirmationModal');
    const modal = bootstrap.Modal.getInstance(modalElement);
      try {
        const response = await fetch(`/admin/deleteProduct/${productIdToDelete}`, {
          method: 'DELETE',
        });
        const result = await response.json();
  
        if (result.status) {
          modal.hide();
          getProductData(); 
          showAlert(result.message, 'success');
        } else {
          showAlert('Error occurred during delete. Please try again later.', 'danger');
        }
      } catch (error) {
        showAlert('Server error. Please try again later.', 'danger');
      }
    }
  });
  
  
  function showEdit(productId) {
    if (productId) {
      window.location.href = `/admin/editProduct?productId=${productId}`;
    }
  }




function showAlert(message, type) {
  const alertBox = document.getElementById('alertBox');
  alertBox.innerHTML = message;
  alertBox.className = `alert alert-${type} show`;
  setTimeout(() => {
    alertBox.className = `alert alert-${type} hide`;
  }, 3000);
}


// remove the params from the url
if (window.location.search) {
      const url = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, url);
    }


