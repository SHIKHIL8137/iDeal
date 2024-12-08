

document.addEventListener("DOMContentLoaded", () => {
  const orders = JSON.parse(document.getElementById("ordersData").textContent); 
  const rowsPerPage = 10; 
  let currentPage = 1; 
  let filteredOrders = [...orders]; 


  const tableBody = document.querySelector("#ordersTable tbody");
  const prevPageButton = document.getElementById("prevPage");
  const nextPageButton = document.getElementById("nextPage");
  const showingText = document.querySelector(".showing1-10Text");
  const filterButtons = document.querySelectorAll(".btn-filter");
  const searchBar = document.getElementById("searchBar");

  const orderIdField = document.getElementById('orderId');
  const orderStatusField = document.getElementById('orderStatus');

  const orderIdDbField = document.getElementById('orderDbid');

  function renderTable(page) {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    tableBody.innerHTML = "";

    filteredOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

    filteredOrders.slice(start, end).forEach(order => {
      const row = `
        <tr>
          <td>${order.orderId}</td>
          <td>
            ${order.userId.firstName} ${order.userId.lastName}<br>
            <small>${order.userId.email}</small>
          </td>
          <td style="max-width: 200px; overflow: hidden;">
            <div style="overflow-y: auto; max-height: 100px; scrollbar-width: none; -ms-overflow-style: none;">
              ${order.products.map(product => `
                <div>
                  <a href="/admin/orderDetails/${order._id}" style="text-decoration: none; color: inherit;">
                  <strong>${product.productId.name}</strong> (₹${product.productId.price})<br>
                  Quantity: ${product.quantity}, Total: ₹${product.total}
                  </a>
                </div>
              `).join('')}
            </div>
          </td>
          <td>${new Date(order.orderDate).toLocaleDateString()}</td>
          <td>
            <strong>Status:</strong> ${order.paymentStatus}<br>
            <strong>Method:</strong> ${order.paymentMethod}
          </td>
          <td>
            <span class="badge ${getStatusBadgeClass(order.status)}">
              ${order.status}
            </span>
          </td>
          <td>₹${order.totalAmount.toFixed(2)}</td>
          <td>
            <button type="button" class="btn btn-sm btn-outline-success editOrderStatusBtn"
                data-bs-toggle="modal" data-bs-target="#editOrderStatusModal"
                data-order-id="${order.orderId}" data-current-status="${order.status}" data-order-dbid="${order._id}"
                 ${['Cancelled', 'Delivered'].includes(order.status) ? 'disabled' : ''}>
          Edit
        </button>
          </td>
        </tr>
      `;
      tableBody.insertAdjacentHTML("beforeend", row);
    });

    showingText.textContent = `Showing ${start + 1}-${Math.min(end, filteredOrders.length)} from ${filteredOrders.length}`;
  }

  function updatePaginationButtons() {
    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage * rowsPerPage >= filteredOrders.length;
  }

  function filterOrders(status) {
    if (status === "All Products") {
      filteredOrders = [...orders];
    } else {
      filteredOrders = orders.filter(order => order.status === status);
    }
    currentPage = 1; 
    renderTable(currentPage);
    updatePaginationButtons();
  }

  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      filterButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      filterOrders(button.textContent.trim());
    });
  });


searchBar.addEventListener("input", (event) => {
  const searchQuery = event.target.value.toLowerCase();

  filteredOrders = orders.filter(order => {
    return order.orderId.toString().includes(searchQuery) || 
           (order.userId.firstName.toLowerCase() + " " + order.userId.lastName.toLowerCase()).includes(searchQuery) || 
           order.userId.email.toLowerCase().includes(searchQuery) || 
           order.products.some(product => product.productId.name.toLowerCase().includes(searchQuery)); 
  });


  currentPage = 1;
  renderTable(currentPage);
  updatePaginationButtons();
});



  prevPageButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderTable(currentPage);
      updatePaginationButtons();
    }
  });

  nextPageButton.addEventListener("click", () => {
    if (currentPage * rowsPerPage < filteredOrders.length) {
      currentPage++;
      renderTable(currentPage);
      updatePaginationButtons();
    }
  });


  renderTable(currentPage);
  updatePaginationButtons();


  function getStatusBadgeClass(status) {
    switch (status) {
      case 'Confirmed': return 'bg-primary';
      case "Delivered": return "bg-success";
      case "Processing": return "bg-warning";
      case "Cancelled": return "bg-danger";
      default: return "bg-secondary";
    }
  }


  document.querySelectorAll('.editOrderStatusBtn').forEach(button => {
    button.addEventListener('click', () => {
      const orderId = button.getAttribute('data-order-id'); 
      const currentStatus = button.getAttribute('data-current-status'); 
      const orderIdDb = button.getAttribute('data-order-dbid');
      console.log(currentStatus)
      orderIdField.value = orderId; 
      orderStatusField.value = currentStatus;
      orderIdDbField.value = orderIdDb;
    });
  });



  
  document.getElementById('saveOrderStatus').addEventListener('click', async () => {
    const confirmSave = confirm('Are you sure you want to save the changes to the order status?');
    
    if (!confirmSave) {
      return;
    }
  
    try {
      const orderId = orderIdDbField.value;
      const newStatus = orderStatusField.value;
      console.log(orderId, newStatus);
      const response = await fetch(`/admin/updateStatusOrder/${orderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      console.log(data);
  
      if (data.success) {
        const modalElement = document.getElementById('editOrderStatusModal');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) {
          modalInstance.hide();
        }
        showAlert('Order status updated successfully', 'success');
        setTimeout(() => {
          window.location.href = '/admin/orders';
        }, 4000);
      } else {
        showAlert('Failed to update the order status', 'danger');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      showAlert('An error occurred. Please try again.', 'danger');
    }
  });
  

  
});



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