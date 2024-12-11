document.addEventListener('DOMContentLoaded', async () => {
  const tbody = document.querySelector('#ordersTable tbody');
  const recordsPerPage = 10; // Items per page
  let currentPage = 1;
  let allData = []; // Holds all the fetched data
  let filteredData = []; // Holds the filtered data

  // Function to render the table with paginated data
  function renderTable(data) {
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const paginatedData = data.slice(startIndex, endIndex);

    tbody.innerHTML = paginatedData.map(request => `
      <tr>
        <td>${request.orderId.orderId}</td>
        <td>${request.userId ? request.userId.email : 'N/A'}</td>
        <td>${request.reason}</td>
        <td>${new Date(request.createdAt).toLocaleDateString()}</td>
        <td>
          <span class="badge ${getStatusBadgeClass(request.adminStatus)}">${request.adminStatus}</span>
        </td>
        <td>${request.refundAmount.toFixed(2)}</td>
        <td>
          <button class="btn btn-outline-success btn-sm">Approve</button>
          <button class="btn btn-outline-danger btn-sm">Reject</button>
        </td>
      </tr>
    `).join('');

    updatePaginationInfo(data.length);
  }

  // Update pagination information
  function updatePaginationInfo(totalRecords) {
    const startRecord = (currentPage - 1) * recordsPerPage + 1;
    const endRecord = Math.min(currentPage * recordsPerPage, totalRecords);

    document.getElementById('paginationInfo').innerText =
      `Showing ${startRecord}-${endRecord} of ${totalRecords}`;
  }

  // Setup pagination controls
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

  // Filter data based on status
  function filterDataByStatus(status) {
    if (status === 'all') {
      return allData; // Return all data if "All" is selected
    }
    return allData.filter(request => request.adminStatus === status);
  }

  // Handle filter button click
  document.getElementById('filterButtons').addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-filter')) {
      // Update active filter button
      document.querySelectorAll('.btn-filter').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');

      // Get the selected status
      const status = e.target.getAttribute('data-status');
      filteredData = filterDataByStatus(status);

      // Reset pagination and render
      currentPage = 1;
      renderTable(filteredData);
      setupPaginationControls(filteredData);
    }
  });

  // Fetch initial data
  async function fetchData() {
    try {
      const response = await fetch('/admin/return-requests');
      const result = await response.json();
      if (result.status) {
        allData = result.data; // Store the fetched data
        filteredData = allData; // Initially, filtered data is the same as all data
        renderTable(filteredData);
        setupPaginationControls(filteredData);
      } else {
        tbody.innerHTML =
          '<tr><td colspan="7" class="text-center text-danger">No return orders found.</td></tr>';
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      tbody.innerHTML =
        '<tr><td colspan="7" class="text-center text-danger">Failed to load data</td></tr>';
    }
  }

  // Get status badge class
  function getStatusBadgeClass(status) {
    switch (status) {
      case 'Pending': return 'bg-warning text-dark';
      case 'Approved': return 'bg-success';
      case 'Rejected': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  // Initialize
  fetchData();
});
