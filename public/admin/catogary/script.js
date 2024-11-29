const rowsPerPage = 10; // Number of rows per page
let currentPage = 1;
const category = JSON.parse(document.getElementById('userData').textContent);
// Function to render the table based on pagination
function renderTable() {
  const tableBody = document.getElementById('categoryTableBody');
  tableBody.innerHTML = '';

  if (category.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="4" class="text-center">No records available.</td></tr>`;
    return;
  }

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, category.length);

  for (let i = startIndex; i < endIndex; i++) {
    const val = category[i];
    const row = `
      <tr>
        <td>${val.name} Series</td>
        <td>
          <span class="badge ${val.status ? 'bg-success' : 'bg-danger'}">
            ${val.status ? 'Listed' : 'Unlisted'}
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

  document.querySelector('.showing1-10Text').textContent = `Showing ${startIndex + 1}-${endIndex} from ${category.length}`;
  updatePaginationButtons();
}

// Function to go to the next page
function goToNextPage() {
  if (currentPage * rowsPerPage < category.length) {
    currentPage++;
    renderTable();
  }
}

// Function to go to the previous page
function goToPrevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderTable();
  }
}

// Function to update the state of pagination buttons
function updatePaginationButtons() {
  document.getElementById('prevPage').disabled = currentPage === 1;
  document.getElementById('nextPage').disabled = currentPage * rowsPerPage >= category.length;
}

// Event listeners for pagination buttons
document.getElementById('nextPage').addEventListener('click', goToNextPage);
document.getElementById('prevPage').addEventListener('click', goToPrevPage);


renderTable();

// showing the modal for delete conformation

let categoryIdToDelete = null;
function showDeleteModal(categoryId) {
  categoryIdToDelete = categoryId
  const deleteModal = new bootstrap.Modal(document.getElementById('deleteCategoryModal'));
  deleteModal.show();
}

// redirecting to edit category

function showEdit(categoryId){
  if (categoryId) {
    window.location.href = `/admin/editCategory/${categoryId}`;
  }
}

// delete conformation

document.getElementById('deleteConfirmButton').addEventListener('click', function () {
  if (categoryIdToDelete) {
    window.location.href = `/admin/deleteCategory/${categoryIdToDelete}`;
  }
});


// redirct to add category

document.getElementById('addCategoryBtn').addEventListener('click', function () {
   console.log('cliked')
    window.location.href = `/admin/addCategory`;
});


// for alert box
const alertBox = document.getElementById("alertBox");
alertBox.classList.add("show");
setTimeout(() => {
  alertBox.classList.remove("show");
  alertBox.classList.add("hide");
  setTimeout(() => {
    alertBox.style.display = "none";
  }, 500); 
}, 3000); 


// remove params form te url
if (window.location.search) {
  const url = window.location.origin + window.location.pathname;
  window.history.replaceState({}, document.title, url);
}