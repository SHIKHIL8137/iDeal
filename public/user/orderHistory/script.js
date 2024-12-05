
  document.addEventListener('DOMContentLoaded', () => {

    const orderRows = document.querySelectorAll('.ratingBtn');


    orderRows.forEach(row => {
      row.addEventListener('click', () => {
        const orderId = row.getAttribute('data-order-id');

        window.location.href = `/user/orderDetails/${orderId}`;
      });
    });



    const rowsPerPage = 10;
  let currentPage = 1;
  const rows = document.querySelectorAll('.order-row');
  const totalPages = Math.ceil(rows.length / rowsPerPage);

  function renderPage(page) {
    rows.forEach(row => {
      const rowPage = parseInt(row.getAttribute('data-page'), 10);
      row.style.display = rowPage === page ? '' : 'none';
    });

    // Update pagination UI
    document.getElementById('prevPage').disabled = page === 1;
    document.getElementById('nextPage').disabled = page === totalPages;
    document.querySelector('.showing1-10Text').innerText =
      `Showing ${(page - 1) * rowsPerPage + 1}-${Math.min(page * rowsPerPage, rows.length)} of ${rows.length}`;
  }

  document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderPage(currentPage);
    }
  });

  document.getElementById('nextPage').addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderPage(currentPage);
    }
  });

  // Initial render
  renderPage(currentPage);
  
  });

