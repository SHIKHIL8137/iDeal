const rowsPerPage = 10; 
let currentPage = 1;
let currentFilter = "all"; 
const userDetails = JSON.parse(document.getElementById("userData").textContent);

// Function to render the table
function renderTable(data) {
  const tableBody = document.querySelector("tbody");
  tableBody.innerHTML = "";

  if (data.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center">No records available.</td></tr>`;
    return;
  }

  // Sort data by 'createdAt' in descending order
  data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, data.length);

  for (let i = startIndex; i < endIndex; i++) {
    const val = data[i];
    const row = `
      <tr>
        <td>${val.username}</td>
        <td>${val.email}</td>
        <td>${val.phone || ""}</td>
        <td>
          <span class="badge ${val.block ? "bg-danger" : "bg-success"}">
            ${val.block ? "Blocked" : "Active"}
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

  document.querySelector(".showing1-10Text").textContent = `Showing ${startIndex + 1}-${endIndex} from ${data.length}`;
}

// Function to handle filter buttons
function filterTable(status) {
  currentPage = 1;
  currentFilter = status;

  // Filter data based on the selected status
  let filteredData;
  if (status === "all") {
    filteredData = userDetails;
  } else if (status === "active") {
    filteredData = userDetails.filter((user) => !user.block);
  } else if (status === "blocked") {
    filteredData = userDetails.filter((user) => user.block);
  }
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

// Helper function to get currently filtered data
function getFilteredData() {
  if (currentFilter === "all") return userDetails;
  if (currentFilter === "active") return userDetails.filter((user) => !user.block);
  if (currentFilter === "blocked") return userDetails.filter((user) => user.block);
}
renderTable(userDetails);



// shw delete modal
function showDeleteModal(userId) {
  userToDelete = userId;
  const modal = new bootstrap.Modal(document.getElementById('deleteConfirmationModal'));
  modal.show();
}


// conform button action for delete
document.getElementById('confirmDeleteButton').addEventListener('click', function () {
  if (userToDelete) {
    const modal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmationModal'));
    modal.hide();
    window.location.href = `/admin/deleteUser/${userToDelete}`;
  }
});

//redirect the edit page
function showEdit(userid) {
  if (userid) {
    window.location.href = `/admin/editCustomer/${userid}`;
  }
}

//redirect the addCustomer page
document.getElementById('addCustomerBtn').addEventListener('click', function () {
  window.location.href = `/admin/addCustomer`;
});

//alart box
function showAlert(message, type = 'success') {
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



// remov the params from the url
if (window.location.search) {
  const url = window.location.origin + window.location.pathname;
  window.history.replaceState({}, document.title, url);
}


