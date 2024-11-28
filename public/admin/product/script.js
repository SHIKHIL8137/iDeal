




const rowsPerPage = 10; // Number of rows per page
let currentPage = 1;
let products = JSON.parse(document.getElementById('userData').textContent);  // Ensure correct data

console.log(products);  // Check the loaded data

let productIdToDelete = null;  // Variable to store product ID for deletion

// Function to render the product table
function renderTable() {
  const tableBody = document.getElementById('productTableBody');
  tableBody.innerHTML = '';  // Clear the table body before re-rendering

  if (products.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center">No products available.</td></tr>`;
    return;
  }

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
        <td>${new Date(val.createdAt).toLocaleDateString()}</td>
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


document.getElementById('categorybtn').addEventListener('click',function(){

window.location.href=`/admin/category`

})


document.getElementById('addProductbtn').addEventListener('click',function(){
  window.location.href=`/admin/addProduct`
})



  const alertBox = document.getElementById("alertBox");
  alertBox.classList.add("show");
  setTimeout(() => {
    alertBox.classList.remove("show");
    alertBox.classList.add("hide");
    setTimeout(() => {
      alertBox.style.display = "none";
    }, 500); 
  }, 3000); 


if (window.location.search) {
      const url = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, url);
    }


