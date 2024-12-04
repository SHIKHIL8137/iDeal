
  document.addEventListener('DOMContentLoaded', () => {

    const orderRows = document.querySelectorAll('.order-row');
    const ratingButtons = document.querySelectorAll('.ratingBtn');

    orderRows.forEach(row => {
      row.addEventListener('click', () => {
        const orderId = row.getAttribute('data-order-id');

        window.location.href = `/user/orderDetails/${orderId}`;
      });
    });

    ratingButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
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

  document.getElementById('reviewSubmitBtn').addEventListener('click', async (event) => {
    event.preventDefault(); // Prevent default form submission
  
    // Gather form data
    const rating = document.querySelector('input[name="rating"]:checked')?.value;
    const feedback = document.getElementById('feedback').value;
  
    if (!rating || !feedback) {
      alert('Please provide both rating and feedback.');
      return;
    }
  
    // Prepare data for submission
    const reviewData = {
      rating: rating,
      feedback: feedback,
    };
  
    try {
      const response = await fetch('/productReview', { // Replace `/submit-review` with your actual API endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });
  
      if (response.ok) {
        alert('Review submitted successfully!');
        // Optionally, reset the form or close the modal
      } else {
        const error = await response.json();
        alert(`Failed to submit review: ${error.message}`);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('An error occurred while submitting your review.');
    }
  });
  
  });

