const queryParams = new URLSearchParams(window.location.search);
const message = queryParams.get('message');

document.addEventListener('DOMContentLoaded', () => {
  getProductData();  
  if(message){
    showAlert(message,'success');
  }
  filterProducts('All');
  document.querySelector('[data-filter="All"]').classList.add('active');
});



const rowsPerPage = 10;
let currentPage = 1;
let orders = [];
let originaloreders = [];

async function getProductData() {
  try {
    const response = await fetch('/admin/getOrderDetails', { method: 'GET' });
    const result = await response.json();
    if (result.status) {
      orders = result.orders;
      originaloreders = [...orders]; 
      renderTable(orders);
      filterProducts('All'); 
    } else {
      showAlert('Failed to fetch orders. Please try again.', 'danger');
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    showAlert('An error occurred while fetching orders. Please try again.', 'danger');
  }
}


function renderTable(order) {
  const tableBody = document.getElementById('productTableBody');
  tableBody.innerHTML = '';

  if (order.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="8" class="text-center">No orders available.</td></tr>`;
    return;
  }

  order.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, order.length);

  for (let i = startIndex; i < endIndex; i++) {
    const val = order[i];
    const row = `
       <tr>
          <td>${val.orderId}</td>
          <td>
            ${val.billingAddress.fname} ${val.billingAddress.lname}<br>
            <small>${val.userId.email}</small>
          </td>
          <td style="max-width: 200px; overflow: hidden;">
            <div style="overflow-y: auto; max-height: 100px; scrollbar-width: none; -ms-overflow-style: none;">
              ${val.products.map(product => `
                <div>
                  <a href="/admin/orderDetails/${val._id}" style="text-decoration: none; color: inherit;">
                  <strong>${product.productId.name}</strong> (₹${product.productId.price})<br>
                  Quantity: ${product.quantity}, Total: ₹${product.total}
                  </a>
                </div>
              `).join('')}
            </div>
          </td>
          <td>${new Date(val.orderDate).toLocaleDateString('en-IN')}</td>
          <td>
            <strong>Status:</strong> ${val.paymentStatus}<br>
            <strong>Method:</strong> ${val.paymentMethod}
          </td>
          <td>
            <span class="badge ${getStatusBadgeClass(val.status)}">
              ${val.status}
            </span>
          </td>
          <td>₹${val.totalAmount.toFixed(2)}</td>
          <td>
            <button type="button" class="btn btn-sm btn-outline-success editOrderStatusBtn"
                data-bs-toggle="modal" data-bs-target="#editOrderStatusModal"
                data-order-id="${val.orderId}" data-current-status="${val.status}" data-order-dbid="${val._id}"
                 ${['Cancelled', 'Delivered', 'Returned'].includes(val.status) ? 'disabled' : ''}>
          Edit
        </button>
          </td>
        </tr>
    `;
    tableBody.innerHTML += row;
  }

  document.querySelector('.showing1-10Text').textContent = `Showing ${startIndex + 1}-${endIndex} of ${order.length}`;
  updatePaginationButtons();
}



function goToNextPage() {
  if (currentPage * rowsPerPage < orders.length) {
    currentPage++;
    renderTable(orders);
  }
}

function goToPrevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderTable(orders);
  }
}

function updatePaginationButtons() {
  document.getElementById('prevPage').disabled = currentPage === 1;
  document.getElementById('nextPage').disabled = currentPage * rowsPerPage >= orders.length;
}


function filterProducts(filterType) {
  switch (filterType) {
    case 'All':
      orders = [...originaloreders];
      break;
    case 'Delivered':
      orders = originaloreders.filter(product => product.status === 'Delivered');
      break;
    case 'Processing':
      orders = originaloreders.filter(product => product.status === 'Processing');
      break;
    case 'Cancelled':
      orders = originaloreders.filter(product => product.status === 'Cancelled');
      break;
  }
  currentPage = 1;
  renderTable(orders);
}

document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', event => {
    document.querySelectorAll('[data-filter]').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    const filterType = event.target.getAttribute('data-filter');
    filterProducts(filterType);
  });
});



document.getElementById('searchBar').addEventListener('input', event => {
  const searchQuery = event.target.value.trim().toLowerCase();
  console.log(searchQuery);

  const filteredOrders = orders.filter(order => {
    const orderId = order.orderId?.toString().toLowerCase()||'';
    const userName = (order.billingAddress?.fname || '') + ' ' + (order.billingAddress?.lname || '');
    const userEmail = order.userId?.email || '';
    const productNames = order.products
      ?.map(product => product.productId?.name?.toLowerCase() || '')
      .join(' ');

    return (
      orderId.includes(searchQuery) || 
      userName.toLowerCase().includes(searchQuery) || 
      userEmail.toLowerCase().includes(searchQuery) || 
      productNames.includes(searchQuery)
    );
  });

  currentPage = 1;
  renderTable(filteredOrders);
});



document.getElementById('nextPage').addEventListener('click', goToNextPage);
document.getElementById('prevPage').addEventListener('click', goToPrevPage);



function getStatusBadgeClass(status) {
  switch (status) {
    case 'Confirmed': return 'bg-primary';
    case "Delivered": return "bg-success";
    case "Processing": return "bg-warning";
    case "Cancelled": return "bg-danger";
    default: return "bg-secondary";
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



document.addEventListener('click', event => {
  if (event.target.classList.contains('editOrderStatusBtn')) {

    const orderId = event.target.getAttribute('data-order-id');
    const currentStatus = event.target.getAttribute('data-current-status');
    const orderDbid = event.target.getAttribute('data-order-dbid');

    document.getElementById('orderId').value = orderId;
    document.getElementById('orderStatus').value = currentStatus;
    document.getElementById('orderDbid').value = orderDbid;
  }
});



  document.getElementById('saveOrderStatus').addEventListener('click', async () => {
    const confirmSave = confirm('Are you sure you want to save the changes to the order status?');
    
    if (!confirmSave) {
      return;
    }

    const newStatus = document.getElementById('orderStatus').value;
    console.log(newStatus);
    const orderDbid = document.getElementById('orderDbid').value;
    try {
      const response = await fetch(`/admin/updateStatusOrder/${orderDbid}`, {
        method: 'PATCH',
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
        getProductData();  
        showAlert('Order status updated successfully', 'success');

      } else {
        showAlert('Failed to update the order status', 'danger');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      showAlert('An error occurred. Please try again.', 'danger');
    }
  });










// document.addEventListener("DOMContentLoaded", () => {
//   const orders = JSON.parse(document.getElementById("ordersData").textContent); 
//   const rowsPerPage = 10; 
//   let currentPage = 1; 
//   let filteredOrders = [...orders]; 
//   const tableBody = document.querySelector("#ordersTable tbody");
//   const prevPageButton = document.getElementById("prevPage");
//   const nextPageButton = document.getElementById("nextPage");
//   const showingText = document.querySelector(".showing1-10Text");
//   const filterButtons = document.querySelectorAll(".btn-filter");
//   const searchBar = document.getElementById("searchBar");

//   const orderIdField = document.getElementById('orderId');
//   const orderStatusField = document.getElementById('orderStatus');

//   const orderIdDbField = document.getElementById('orderDbid');

//   function renderTable(page) {
//     const start = (page - 1) * rowsPerPage;
//     const end = start + rowsPerPage;

//     tableBody.innerHTML = "";

//     filteredOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

//     if(filteredOrders.length === 0){
//       tableBody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">No orders found.</td></tr>';
//     }

//     filteredOrders.slice(start, end).forEach(order => {
//       const row = `
//         <tr>
//           <td>${order.orderId}</td>
//           <td>
//             ${order.billingAddress.fname} ${order.billingAddress.lname}<br>
//             <small>${order.userId.email}</small>
//           </td>
//           <td style="max-width: 200px; overflow: hidden;">
//             <div style="overflow-y: auto; max-height: 100px; scrollbar-width: none; -ms-overflow-style: none;">
//               ${order.products.map(product => `
//                 <div>
//                   <a href="/admin/orderDetails/${order._id}" style="text-decoration: none; color: inherit;">
//                   <strong>${product.productId.name}</strong> (₹${product.productId.price})<br>
//                   Quantity: ${product.quantity}, Total: ₹${product.total}
//                   </a>
//                 </div>
//               `).join('')}
//             </div>
//           </td>
//           <td>${new Date(order.orderDate).toLocaleDateString('en-IN')}</td>
//           <td>
//             <strong>Status:</strong> ${order.paymentStatus}<br>
//             <strong>Method:</strong> ${order.paymentMethod}
//           </td>
//           <td>
//             <span class="badge ${getStatusBadgeClass(order.status)}">
//               ${order.status}
//             </span>
//           </td>
//           <td>₹${order.totalAmount.toFixed(2)}</td>
//           <td>
//             <button type="button" class="btn btn-sm btn-outline-success editOrderStatusBtn"
//                 data-bs-toggle="modal" data-bs-target="#editOrderStatusModal"
//                 data-order-id="${order.orderId}" data-current-status="${order.status}" data-order-dbid="${order._id}"
//                  ${['Cancelled', 'Delivered' , 'Returned'].includes(order.status) ? 'disabled' : ''}>
//           Edit
//         </button>
//           </td>
//         </tr>
//       `;
//       tableBody.insertAdjacentHTML("beforeend", row);
//     });

//     showingText.textContent = `Showing ${start + 1}-${Math.min(end, filteredOrders.length)} from ${filteredOrders.length}`;
//   }

//   function updatePaginationButtons() {
//     prevPageButton.disabled = currentPage === 1;
//     nextPageButton.disabled = currentPage * rowsPerPage >= filteredOrders.length;
//   }

//   function filterOrders(status) {
//     if (status === "All Products") {
//       filteredOrders = [...orders];
//     } else {
//       filteredOrders = orders.filter(order => order.status === status);
//     }
//     currentPage = 1; 
//     renderTable(currentPage);
//     updatePaginationButtons();
//   }

//   filterButtons.forEach(button => {
//     button.addEventListener("click", () => {
//       filterButtons.forEach(btn => btn.classList.remove("active"));
//       button.classList.add("active");
//       filterOrders(button.textContent.trim());
//     });
//   });


// searchBar.addEventListener("input", (event) => {
//   const searchQuery = event.target.value.toLowerCase();

//   filteredOrders = orders.filter(order => {
//     return order.orderId.toString().includes(searchQuery) || 
//            (order.userId.firstName.toLowerCase() + " " + order.userId.lastName.toLowerCase()).includes(searchQuery) || 
//            order.userId.email.toLowerCase().includes(searchQuery) || 
//            order.products.some(product => product.productId.name.toLowerCase().includes(searchQuery)); 
//   });


//   currentPage = 1;
//   renderTable(currentPage);
//   updatePaginationButtons();
// });



//   prevPageButton.addEventListener("click", () => {
//     if (currentPage > 1) {
//       currentPage--;
//       renderTable(currentPage);
//       updatePaginationButtons();
//     }
//   });

//   nextPageButton.addEventListener("click", () => {
//     if (currentPage * rowsPerPage < filteredOrders.length) {
//       currentPage++;
//       renderTable(currentPage);
//       updatePaginationButtons();
//     }
//   });


//   renderTable(currentPage);
//   updatePaginationButtons();


//   function getStatusBadgeClass(status) {
//     switch (status) {
//       case 'Confirmed': return 'bg-primary';
//       case "Delivered": return "bg-success";
//       case "Processing": return "bg-warning";
//       case "Cancelled": return "bg-danger";
//       default: return "bg-secondary";
//     }
//   }


//   document.querySelectorAll('.editOrderStatusBtn').forEach(button => {
//     button.addEventListener('click', () => {
//       const orderId = button.getAttribute('data-order-id'); 
//       const currentStatus = button.getAttribute('data-current-status'); 
//       const orderIdDb = button.getAttribute('data-order-dbid');
//       console.log(currentStatus,orderId,orderIdDb)
//       orderIdField.value = orderId; 
//       orderStatusField.value = currentStatus;
//       orderIdDbField.value = orderIdDb;
//     });
//   });



  
//   document.getElementById('saveOrderStatus').addEventListener('click', async () => {
//     const confirmSave = confirm('Are you sure you want to save the changes to the order status?');
    
//     if (!confirmSave) {
//       return;
//     }
  
//     try {
//       const orderId = orderIdDbField.value;
//       const newStatus = orderStatusField.value;
//       console.log(orderId, newStatus);
//       const response = await fetch(`/admin/updateStatusOrder/${orderId}`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ status: newStatus }),
//       });
//       const data = await response.json();
//       console.log(data);
  
//       if (data.success) {
//         const modalElement = document.getElementById('editOrderStatusModal');
//         const modalInstance = bootstrap.Modal.getInstance(modalElement);
//         if (modalInstance) {
//           modalInstance.hide();
//         }
//         showAlert('Order status updated successfully', 'success');
//         setTimeout(() => {
//           window.location.href = '/admin/orders';
//         }, 4000);
//       } else {
//         showAlert('Failed to update the order status', 'danger');
//       }
//     } catch (error) {
//       console.error('Error updating order status:', error);
//       showAlert('An error occurred. Please try again.', 'danger');
//     }
//   });
  

  
// });



// function showAlert(message, type) {

//   const alertBox = document.createElement('div');
//   alertBox.id = 'alertBox';
//   alertBox.className = `alert alert-${type} show`;
//   alertBox.role = 'alert';
//   alertBox.innerHTML = message;
//   document.body.appendChild(alertBox);
//   setTimeout(() => {
//       alertBox.classList.remove('show');
//       alertBox.classList.add('hide');
//       setTimeout(() => alertBox.remove(), 700); 
//   }, 3000);
// }