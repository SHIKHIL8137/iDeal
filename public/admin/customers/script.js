
const rowsPerPage = 10; // Number of rows per page
let currentPage = 1;
const userDetails = JSON.parse(document.getElementById('userData').textContent);
console.log(document.getElementById('userData').textContent);

function renderTable() {
  const tableBody = document.querySelector('tbody');
  tableBody.innerHTML = '';

  if (userDetails.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center">No records available.</td></tr>`;
    return;
  }

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, userDetails.length);

  for (let i = startIndex; i < endIndex; i++) {
    const val = userDetails[i];
    const row = `
      <tr>
        <td>${val.username}</td>
        <td>${val.email}</td>
        <td>${val.phone}</td>
        <td>
          <span class="badge ${val.block ? 'bg-danger' : 'bg-success'}">
            ${val.block ? 'Blocked' : 'Active'}
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

  document.querySelector('.showing1-10Text').textContent = `Showing ${startIndex + 1}-${endIndex} from ${userDetails.length}`;
}

function goToNextPage() {
  if (currentPage * rowsPerPage < userDetails.length) {
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

document.getElementById('nextPage').addEventListener('click', goToNextPage);
document.getElementById('prevPage').addEventListener('click', goToPrevPage);

renderTable();

function showDeleteModal(userId) {
  userToDelete = userId;
  const modal = new bootstrap.Modal(document.getElementById('deleteConfirmationModal'));
  modal.show();
}

document.getElementById('confirmDeleteButton').addEventListener('click', function () {
  if (userToDelete) {
    const modal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmationModal'));
    modal.hide();
    window.location.href = `/admin/deleteUser/${userToDelete}`;
  }
});

function showEdit(userid) {
  if (userid) {
    window.location.href = `/admin/editCustomer/${userid}`;
  }
}

document.getElementById('addCustomerBtn').addEventListener('click', function () {
  window.location.href = `/admin/addCustomer`;
});

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




if (window.location.search) {
  const url = window.location.origin + window.location.pathname;
  window.history.replaceState({}, document.title, url);
}


