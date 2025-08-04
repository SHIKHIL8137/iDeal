

document.addEventListener('DOMContentLoaded',getCartCount)
async function getCartCount(){
try {
    const res = await fetch("/user/cartCount");
    const data = await res.json();
    const badge = document.getElementById("cartCount");

    if (data.count > 0) {
      badge.textContent = data.count;
      badge.style.display = "flex";
    }
  } catch (err) {
    console.error("Cart count load failed:", err);
  }
}



function copyToClipboard(inputId, badgeId) {
  const inputElement = document.getElementById(inputId);
  const badge = document.getElementById(badgeId);

  // Select and copy the text
  inputElement.select();
  inputElement.setSelectionRange(0, 99999); // For mobile devices
  navigator.clipboard.writeText(inputElement.value).then(() => {
    // Show the specific badge
    badge.style.opacity = '1';
    badge.style.transform = 'translateY(-10px)';

    // Hide the badge after 2 seconds
    setTimeout(() => {
      badge.style.opacity = '0';
      badge.style.transform = 'translateY(0)';
    }, 2000);
  });
}

  document.addEventListener('DOMContentLoaded', () => {
    const rows = Array.from(document.querySelectorAll('table tbody tr')); // Get all rows
    const rowsPerPage = 5;
    let currentPage = 1;

    const showingText = document.getElementById('showingText');
    const prevPageButton = document.getElementById('prevPage');
    const nextPageButton = document.getElementById('nextPage');

    // Function to update the visible rows
    const updateTable = () => {
      const start = (currentPage - 1) * rowsPerPage;
      const end = start + rowsPerPage;

      rows.forEach((row, index) => {
        row.style.display = index >= start && index < end ? '' : 'none';
      });

      // Update navigation
      prevPageButton.disabled = currentPage === 1;
      nextPageButton.disabled = end >= rows.length;

      // Update showing text
      const showingStart = start + 1;
      const showingEnd = Math.min(end, rows.length);
      showingText.textContent = `Showing ${showingStart}-${showingEnd} of ${rows.length} entries`;
    };

    // Event listeners for navigation buttons
    prevPageButton.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        updateTable();
      }
    });

    nextPageButton.addEventListener('click', () => {
      if (currentPage * rowsPerPage < rows.length) {
        currentPage++;
        updateTable();
      }
    });

    // Initialize table display
    updateTable();
  });

