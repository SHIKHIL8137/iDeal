
  document.addEventListener('DOMContentLoaded', () => {
    function setupOrderDetailsButtons(buttonClass, dataAttribute) {
      const buttons = document.querySelectorAll(buttonClass);
      buttons.forEach(button => {
        button.addEventListener('click', () => {
          const orderId = button.getAttribute(dataAttribute);
          window.location.href = `/user/orderDetails/${orderId}`;
        });
      });
      
    }
    function setupPendingDetailsButtons(buttonClass, dataAttribute) {
      const buttons = document.querySelectorAll(buttonClass);
      buttons.forEach(button => {
        button.addEventListener('click', () => {
          const orderId = button.getAttribute(dataAttribute);
          window.location.href = `/user/pendingDetails?orderId=${orderId}`;
        });
      });
      
    }
  
    function setupPagination(rowsClass, rowsPerPage, prevButtonId, nextButtonId, showingTextClass) {
      let currentPage = 1;
      const rows = document.querySelectorAll(rowsClass);
      const totalPages = Math.ceil(rows.length / rowsPerPage);
  
      function renderPage(page) {
        rows.forEach(row => {
          const rowPage = parseInt(row.getAttribute('data-page'), 10);
          row.style.display = rowPage === page ? '' : 'none';
        });
  
        document.getElementById(prevButtonId).disabled = page === 1;
        document.getElementById(nextButtonId).disabled = page === totalPages;
  
        const showingText = document.querySelector(showingTextClass);
        showingText.innerText =
          `Showing ${(page - 1) * rowsPerPage + 1}-${Math.min(page * rowsPerPage, rows.length)} of ${rows.length}`;
      }
  
      document.getElementById(prevButtonId).addEventListener('click', () => {
        if (currentPage > 1) {
          currentPage--;
          renderPage(currentPage);
        }
      });
  
      document.getElementById(nextButtonId).addEventListener('click', () => {
        if (currentPage < totalPages) {
          currentPage++;
          renderPage(currentPage);
        }
      });
  
      renderPage(currentPage);
    }
  
    setupOrderDetailsButtons('.OrderDetailsBtn', 'data-order-id');
    setupPagination('.order-row', 10, 'prevPage', 'nextPage', '.showing1-10Text');

    setupPendingDetailsButtons('.PendingBtn', 'data-Pending-id');
    setupPagination('.pendingOrder-row', 10, 'PendingPrevPage', 'PendingNextPage', '.pendingShowing1-10Text');
  });
  