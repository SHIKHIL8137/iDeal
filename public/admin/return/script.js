document.addEventListener('DOMContentLoaded', async () => {
  fetchData();
});

const tbody = document.querySelector('#ordersTable tbody');
  const recordsPerPage = 10; 
  let currentPage = 1;
  let allData = [];
  let filteredData = []; 

  function renderTable(data) {
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const paginatedData = data.slice(startIndex, endIndex);

    tbody.innerHTML = paginatedData.map(request => `
      <tr>
        <td>${request.orderId.orderId}</td>
        <td>${request.userId ? request.userId.email : 'N/A'}</td>
         <td>${request.productId ? request.productId.name : 'N/A'}</td>
        <td class="reason-cell" data-bs-toggle="tooltip" data-bs-placement="top" title="Click to view details">
          <a href="/admin/returnOrderDetails/${request._id}" class="text-decoration-none text-black">${request.reason}</a>
        </td>
        <td>${new Date(request.createdAt).toLocaleDateString('en-IN')}</td>
        <td>
          <span class="badge ${getStatusBadgeClass(request.adminStatus)}">${request.adminStatus}</span>
        </td>
        <td>${request.refundAmount.toFixed(2)}</td>
        <td>
          <button class="btn btn-outline-success btn-sm" 
                  onclick="showApproveModal('${request._id}')"
                  style="display: ${request.adminStatus === 'Pending' ? 'inline-block' : 'none'};">
            Approve
          </button>
          <button class="btn btn-outline-danger btn-sm" 
                  onclick="showRejectModal('${request._id}')"
                  style="display: ${request.adminStatus === 'Pending' ? 'inline-block' : 'none'};">
            Reject
          </button>
          <span class="text-danger" style="display: ${request.adminStatus === 'Rejected' ? 'inline' : 'none'};">
            Rejected
          </span>
          <span class="text-success" style="display: ${request.adminStatus === 'Approved' ? 'inline' : 'none'};">
            Approved
          </span>
        </td>
      </tr>
    `).join('');
    
    updatePaginationInfo(data.length);
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.forEach((tooltipTriggerEl) => {
    new bootstrap.Tooltip(tooltipTriggerEl);
  });
  }


  function updatePaginationInfo(totalRecords) {
    const startRecord = (currentPage - 1) * recordsPerPage + 1;
    const endRecord = Math.min(currentPage * recordsPerPage, totalRecords);

    document.getElementById('paginationInfo').innerText =
      `Showing ${startRecord}-${endRecord} of ${totalRecords}`;
  }

  function setupPaginationControls(data) {
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage * recordsPerPage >= data.length;

    document.getElementById('prevPage').addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderTable(data);
      }
    });

    document.getElementById('nextPage').addEventListener('click', () => {
      if (currentPage * recordsPerPage < data.length) {
        currentPage++;
        renderTable(data);
      }
    });
  }


  function filterDataByStatus(status) {
    if (status === 'all') {
      return allData; 
    }
    return allData.filter(request => request.adminStatus === status);
  }


  document.getElementById('filterButtons').addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-filter')) {

      document.querySelectorAll('.btn-filter').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');

      const status = e.target.getAttribute('data-status');
      filteredData = filterDataByStatus(status);

      currentPage = 1;
      renderTable(filteredData);
      setupPaginationControls(filteredData);
    }
  });


  async function fetchData() {
    try {
      const response = await fetch('/admin/return-requests');
      const result = await response.json();
      if (result.status) {
        allData = result.data;
        filteredData = allData; 
        renderTable(filteredData);
        setupPaginationControls(filteredData);
      } else {
        tbody.innerHTML =
          '<tr><td colspan="8" class="text-center text-danger">No return orders found.</td></tr>';
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      tbody.innerHTML =
        '<tr><td colspan="8" class="text-center text-danger">Failed to load data</td></tr>';
    }
  }


  function getStatusBadgeClass(status) {
    switch (status) {
      case 'Pending': return 'bg-warning text-dark';
      case 'Approved': return 'bg-success';
      case 'Rejected': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }



let currentAction = null;  
let currentReturnCancelId = null;

function showApproveModal(returnCancelId) {
  currentAction = 'approve';
  currentReturnCancelId = returnCancelId;

  const approveModal = new bootstrap.Modal(document.getElementById('approveModal'));
  approveModal.show();
}

function showRejectModal(returnCancelId) {
  currentAction = 'reject';
  currentReturnCancelId = returnCancelId;

  const rejectModal = new bootstrap.Modal(document.getElementById('rejectModal'));
  rejectModal.show();
}

// Confirm Approval action
document.getElementById('confirmApprovalButton').addEventListener('click', async () => {
  try {
    await approve(currentReturnCancelId);
    const approveModal = bootstrap.Modal.getInstance(document.getElementById('approveModal'));
    approveModal.hide();
    currentAction = null;
    currentReturnCancelId = null;
  } catch (error) {
    console.error('Error processing approval:', error);
    showAlert('An unexpected error occurred while approving the request.', 'danger');
  }
});

// Confirm Rejection action
document.getElementById('confirmRejectionButton').addEventListener('click', async () => {
  try {
    const reason = document.getElementById('rejectionReason').value;
    await reject(currentReturnCancelId, reason);
    const rejectModal = bootstrap.Modal.getInstance(document.getElementById('rejectModal'));
    rejectModal.hide();
    currentAction = null;
    currentReturnCancelId = null;
  } catch (error) {
    console.error('Error processing rejection:', error);
    showAlert('An unexpected error occurred while rejecting the request.', 'danger');
  }
});

// Approval function
async function approve(returnCancelId) {
  try {
    const response = await fetch(`/admin/returnApprove`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ returnCancelId }),
    });

    const data = await response.json();
    if (response.ok) {
      showAlert(data.message, 'success');
      fetchData();
    } else {
      showAlert(data.message || 'Failed to approve the return request.', 'danger');
    }
  } catch (error) {
    console.error('Error approving request:', error);
    showAlert('Failed to approve the return request.', 'danger');
  }
}

// Rejection function
async function reject(returnCancelId, reason) {
  try {
    const response = await fetch(`/admin/returnReject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ returnCancelId, reason }),
    });

    const data = await response.json();
    if (response.ok) {
      showAlert(data.message, 'success');
      fetchData();
    } else {
      showAlert(data.message || 'Failed to reject the return request.', 'danger');
    }
  } catch (error) {
    console.error('Error rejecting request:', error);
    showAlert('Failed to reject the return request.', 'danger');
  }
}


function showAlert(message, type) {

  const alertBox = document.createElement('div');
  alertBox.id = 'alertBox';
  alertBox.className = `alert alert-${type} show`;
  alertBox.role = 'alert';
  alertBox.innerHTML = message;
  document.body.appendChild(alertBox);
  setTimeout(() => {
      alertBox.classList.remove('show');
      alertBox.classList.add('hide');
      setTimeout(() => alertBox.remove(), 700); 
  }, 3000);
}