const queryParams = new URLSearchParams(window.location.search);
const message = queryParams.get('message');

document.addEventListener('DOMContentLoaded', () => {
  getCustomersData();
  if(message){
    showAlert(message,'success')
  }
});

const rowsPerPage = 10;
let currentPage = 1;
let currentFilter = "all";
let userDetails = [];

// Fetch customer data from the server
async function getCustomersData() {
  const tableBody = document.querySelector("tbody");
  try {
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center">Loading...</td></tr>`;
    const response = await fetch('/admin/getCustomersDetails');
    const result = await response.json();
    if (result.status) {
      userDetails = result.userDetails;
      renderTable(userDetails);
    } else {
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Failed to load data.</td></tr>`;
    }
  } catch (error) {
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error fetching data.</td></tr>`;
    console.error("Error fetching customer data:", error);
  }
}

// Render table with data
function renderTable(data) {
  const tableBody = document.querySelector("tbody");
  tableBody.innerHTML = "";

  if (data.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">No records available.</td></tr>`;
    return;
  }

  // Sort data by 'createdAt' in descending order
  data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, data.length);
  const fragment = document.createDocumentFragment();

  for (let i = startIndex; i < endIndex; i++) {
    const val = data[i];
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${val.username}</td>
      <td>${val.email}</td>
      <td>${val.phone || ""}</td>
      <td>
        <span class="badge ${val.block ? "bg-danger" : "bg-success"}">
          ${val.block ? "Blocked" : "Active"}
        </span>
      </td>
      <td>${new Date(val.createdAt).toLocaleDateString('en-IN')}</td>
      <td>
        <button class="btn btn-sm btn-outline-secondary" onclick="showEdit('${val._id}')">Edit</button>
        <button class="btn btn-sm btn-outline-danger" onclick="showDeleteModal('${val._id}')">Delete</button>
      </td>
    `;
    fragment.appendChild(row);
  }

  tableBody.appendChild(fragment);
  document.querySelector(".showing1-10Text").textContent = `Showing ${startIndex + 1}-${endIndex} from ${data.length}`;
}

// Handle filter buttons
function filterTable(status) {
  currentPage = 1;
  currentFilter = status;

  const filteredData = getFilteredData();
  renderTable(filteredData);
}

// Event listeners for filter buttons
document.querySelectorAll(".filter-btn").forEach((button) => {
  button.addEventListener("click", (e) => {
    document.querySelectorAll(".filter-btn").forEach((btn) => btn.classList.remove("active"));
    e.target.classList.add("active");
    const status = e.target.getAttribute("data-status");
    filterTable(status);
  });
});

// Pagination functions
function goToNextPage() {
  const filteredData = getFilteredData();
  if (currentPage * rowsPerPage < filteredData.length) {
    currentPage++;
    renderTable(filteredData);
  }
}

function goToPrevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderTable(getFilteredData());
  }
}

document.getElementById("nextPage").addEventListener("click", goToNextPage);
document.getElementById("prevPage").addEventListener("click", goToPrevPage);

// Get filtered data based on the current filter
function getFilteredData() {
  if (currentFilter === "all") return userDetails;
  if (currentFilter === "active") return userDetails.filter((user) => !user.block);
  if (currentFilter === "blocked") return userDetails.filter((user) => user.block);
  return [];
}

// Show delete modal
let userToDelete = null;
function showDeleteModal(userId) {
  userToDelete = userId;
  const modal = new bootstrap.Modal(document.getElementById('deleteConfirmationModal'));
  modal.show();
}

// Confirm delete action
document.getElementById('confirmDeleteButton').addEventListener('click', async function () {
  try {
    const response = await fetch(`/admin/deleteUser/${userToDelete}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    if (result.status) {
      const modal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmationModal'));
      modal.hide();
      showAlert(result.message, 'success');
      getCustomersData();
    } else {
      showAlert(result.message || 'An error occurred while deleting the user', 'danger');
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    showAlert('A network error occurred. Please try again later.', 'danger');
  }
});


// Redirect to edit page
function showEdit(userId) {
  if (userId) {
    window.location.href = `/admin/editCustomer/${userId}`;
  }
}

// Redirect to add customer page
document.getElementById('addCustomerBtn').addEventListener('click', function () {
  window.location.href = `/admin/addCustomer`;
});

// Show alert message
function showAlert(message, type = 'success') {
  const alertBox = document.getElementById("alertBox");
  if (alertBox) {
    alertBox.textContent = message;
    alertBox.className = `alert alert-${type} show`;
    setTimeout(() => {
      alertBox.classList.remove('show');
      alertBox.classList.add('hide');
      setTimeout(() => {
        alertBox.style.display = 'none';
      }, 500);
    }, 3000);
  }
}

if (window.location.search) {
  const url = window.location.origin + window.location.pathname;
  window.history.replaceState({}, document.title, url);
}
