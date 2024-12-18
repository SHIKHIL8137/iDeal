let transactions = []; 
let filteredTransactions = []; 
let currentPage = 1;
const rowsPerPage = 10;


async function fetchTransactions() {
  try {
    const response = await fetch('/admin/transactionsTable');
    if (!response.ok) throw new Error('Failed to fetch transactions');

    transactions = await response.json();
    filteredTransactions = [...transactions]; 
    renderTable();
    updatePaginationInfo();
  } catch (error) {
    console.error('Error fetching transactions:', error);
  }
}

// Render the current page of transactions
function renderTable() {
  const tableBody = document.querySelector('#transactionsTable tbody');
  tableBody.innerHTML = ''; // Clear existing rows

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, filteredTransactions.length);

  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);
  currentTransactions.forEach(transaction => {
    const row = `
      <tr>
        <td>${transaction.transactionId}</td>
        <td>${transaction.customer}</td>
        <td>${transaction.paymentMethod}</td>
        <td><span class="badge ${getBadgeClass(transaction.transactionType)}">
          ${transaction.transactionType.toUpperCase()}
        </span></td>
        <td>${new Date(transaction.createdAt).toLocaleDateString()}</td>
        <td>₹${transaction.amount.toFixed(2)}</td>
      </tr>
    `;
    tableBody.insertAdjacentHTML('beforeend', row);
  });
}

// Update pagination info
function updatePaginationInfo() {
  const totalRows = filteredTransactions.length;
  const start = (currentPage - 1) * rowsPerPage + 1;
  const end = Math.min(currentPage * rowsPerPage, totalRows);

  document.getElementById('paginationInfo').innerText = `Showing ${start}-${end} of ${totalRows}`;
  document.getElementById('prevPage').disabled = currentPage === 1;
  document.getElementById('nextPage').disabled = end >= totalRows;
}

// Filter transactions based on the selected type
function filterTransactions(type) {
  currentPage = 1; // Reset to the first page
  if (type === 'all') {
    filteredTransactions = [...transactions];
  } else {
    filteredTransactions = transactions.filter(transaction => 
      transaction.transactionType.toLowerCase() === type.toLowerCase()
    );
  }
  renderTable();
  updatePaginationInfo();
}

// Event listeners for pagination
document.getElementById('prevPage').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderTable();
    updatePaginationInfo();
  }
});

document.getElementById('nextPage').addEventListener('click', () => {
  if (currentPage * rowsPerPage < filteredTransactions.length) {
    currentPage++;
    renderTable();
    updatePaginationInfo();
  }
});

// Event listeners for filter buttons
document.querySelectorAll('.btn-filter').forEach(button => {
  button.addEventListener('click', (e) => {
    document.querySelectorAll('.btn-filter').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');

    const filterType = e.target.getAttribute('data-status');
    filterTransactions(filterType);
  });
});

// Utility function for badge class
function getBadgeClass(transactionType) {
  switch (transactionType.toLowerCase()) {
    case 'credit': return 'bg-success';
    case 'debit': return 'bg-warning';
    case 'refund': return 'bg-danger';
    default: return 'bg-secondary';
  }
}

// Initial fetch
fetchTransactions();
