const queryParams = new URLSearchParams(window.location.search);
const message = queryParams.get('message');

let categorys = []; 
const rowsPerPage = 10;
let currentPage = 1;

document.addEventListener('DOMContentLoaded', () => {
  getCategoryData();

  if (message) {
    showAlert(message, 'success');
  }

  document.getElementById('nextPage').addEventListener('click', goToNextPage);
  document.getElementById('prevPage').addEventListener('click', goToPrevPage);

  document.querySelector('.form-control').addEventListener('input', handleSearch);
  document.getElementById('addCategoryBtn').addEventListener('click', () => {
    window.location.href = `/admin/addCategory`;
  });

  document.getElementById('deleteConfirmButton').addEventListener('click', handleDelete);
});

async function getCategoryData() {
  try {
    const response = await fetch('/admin/getCategoryDetails');
    if (!response.ok) throw new Error('Failed to fetch category details.');

    const result = await response.json();
    if (result.status) {
      categorys = result.category;
      renderTable();
    } else {
      showAlert('Error fetching category.', 'danger');
    }
  } catch (error) {
    showAlert('Error fetching the category data', 'danger');
    console.error(error);
  }
}

function renderTable() {
  const tableBody = document.getElementById('categoryTableBody');
  tableBody.innerHTML = '';

  if (categorys.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="4" class="text-center">No records available.</td></tr>`;
    return;
  }

  categorys.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, categorys.length);

  for (let i = startIndex; i < endIndex; i++) {
    const val = categorys[i];
    const row = `
      <tr>
        <td>${val.name} Series</td>
        <td>
          <span class="badge ${val.status ? 'bg-success' : 'bg-danger'}">
            ${val.status ? 'Listed' : 'Unlisted'}
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

  document.querySelector('.showing1-10Text').textContent = `Showing ${startIndex + 1}-${endIndex} from ${categorys.length}`;
  updatePaginationButtons();
}

function goToNextPage() {
  if (currentPage * rowsPerPage < categorys.length) {
    currentPage++;
    renderTable();
  }
}

function goToPrevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderTable();
  }
}

function updatePaginationButtons() {
  document.getElementById('prevPage').disabled = currentPage === 1;
  document.getElementById('nextPage').disabled = currentPage * rowsPerPage >= categorys.length;
}

function handleSearch(event) {
  const searchQuery = event.target.value.trim().toLowerCase();
  const filteredCategories = categorys.filter(item => item.name.toLowerCase().includes(searchQuery));

  const tableBody = document.getElementById('categoryTableBody');
  tableBody.innerHTML = '';

  if (filteredCategories.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="4" class="text-center">No matching records found.</td></tr>`;
  } else {
    filteredCategories.forEach(val => {
      const row = `
        <tr>
          <td>${val.name} Series</td>
          <td>
            <span class="badge ${val.status ? 'bg-success' : 'bg-danger'}">
              ${val.status ? 'Listed' : 'Unlisted'}
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
    });
  }

  document.querySelector('.showing1-10Text').textContent = `Showing 1-${Math.min(rowsPerPage, filteredCategories.length)} from ${filteredCategories.length}`;
  document.getElementById('prevPage').disabled = true;
  document.getElementById('nextPage').disabled = true;
}

// Show delete modal
let categoryIdToDelete = null;
function showDeleteModal(categoryId) {
  categoryIdToDelete = categoryId;
  const deleteModal = new bootstrap.Modal(document.getElementById('deleteCategoryModal'));
  deleteModal.show();
}

async function handleDelete() {
try{
  const modalElement = document.getElementById('deleteCategoryModal');
  const modal = bootstrap.Modal.getInstance(modalElement);
  const response = await fetch(`/admin/deleteCategory/${categoryIdToDelete}`,{
    method : 'DELETE'
  })

  if (!response.ok) throw new Error('Failed to fetch category details.');

  const result = await response.json();
  
  if (result.status) {
    modal.hide();
    getCategoryData(); 
    showAlert(result.message, 'success');
  } else {
    showAlert('Error occurred during delete. Please try again later.', 'danger');
  }
} catch (error) {
  showAlert('Server error. Please try again later.', 'danger');
}
}

function showEdit(categoryId) {
  if (categoryId) {
    window.location.href = `/admin/editCategory/${categoryId}`;
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

if (window.location.search) {
  const url = window.location.origin + window.location.pathname;
  window.history.replaceState({}, document.title, url);
}
