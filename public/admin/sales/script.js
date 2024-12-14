

document.addEventListener('DOMContentLoaded', toggleDateFields);

document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.getElementById('productTableBody');
    const totalSalesElement = document.getElementById('totalSales');
    const orderCountElement = document.getElementById('orderCount');
    const totalDiscountElement = document.getElementById('totalDiscount');

    const prevPageButton = document.getElementById('prevPage');
    const nextPageButton = document.getElementById('nextPage');
    const showingText = document.querySelector('.showing1-10Text');

    let orders = [];
    let currentPage = 1;
    const rowsPerPage = 10;

    tableBody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';
    totalSalesElement.textContent = '₹0.00';
    orderCountElement.textContent = '0';
    totalDiscountElement.textContent = '₹0.00';

    try {
        const response = await fetch('/admin/getSalesTable');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();

        if (!responseData.status || !Array.isArray(responseData.data)) {
            throw new Error('Invalid data format received from server');
        }

        orders = responseData.data;

        let totalSales = 0;
        let totalDiscounts = 0;
        const orderCount = orders.length;

        orders.forEach(order => {
            totalSales += order.totalAmount;
            totalDiscounts += order.discount;
        });

        totalSalesElement.textContent = `₹${totalSales.toFixed(2)}`;
        orderCountElement.textContent = orderCount.toString();
        totalDiscountElement.textContent = `₹${totalDiscounts.toFixed(2)}`;

        renderTable();

    } catch (error) {
        console.error('Error fetching table data:', error);
        tableBody.innerHTML = `<tr><td colspan="5">Failed to load data. Please try again later.</td></tr>`;
    }

    function renderTable() {
        tableBody.innerHTML = '';
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const paginatedOrders = orders.slice(start, end);

        if (paginatedOrders.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5">No data available</td></tr>';
        } else {
            paginatedOrders.forEach(order => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${new Date(order.orderDate).toLocaleString('en-IN')}</td>
                    <td>${order.orderId}</td>
                    <td>₹${order.total_Amt_WOT_Discount.toFixed(2)}</td>
                    <td>₹${order.discount.toFixed(2)}</td>
                    <td>₹${order.totalAmount.toFixed(2)}</td>
                `;
                tableBody.appendChild(tr);
            });
        }

        const totalPages = Math.ceil(orders.length / rowsPerPage);
        showingText.textContent = `Showing ${start + 1}-${Math.min(end, orders.length)} from ${orders.length}`;

        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = currentPage === totalPages;
    }

    prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    });

    nextPageButton.addEventListener('click', () => {
        const totalPages = Math.ceil(orders.length / rowsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
        }
    });
});

function toggleDateFields() {
    const predefinedRange = document.getElementById('predefinedRange').value;
    const startDateField = document.getElementById('startDate');
    const endDateField = document.getElementById('endDate');
    const startDateContainer = document.getElementById('startDateContainer');
    const endDateContainer = document.getElementById('endDateContainer');

    const today = new Date();
    let startDate, endDate;

    switch (predefinedRange) {
        case '1-day':
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 1);
            endDate = today;
            break;
        case '1-week':
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 7);
            endDate = today;
            break;
        case '1-month':
            startDate = new Date(today);
            startDate.setMonth(today.getMonth() - 1);
            endDate = today;
            break;
        case 'custom':
        default:
            startDate = '';
            endDate = '';
            break;
    }

    if (predefinedRange === 'custom') {
        startDateContainer.style.display = 'block';
        endDateContainer.style.display = 'block';
        startDateField.disabled = false;
        endDateField.disabled = false;
    } else {
        startDateContainer.style.display = 'none';
        endDateContainer.style.display = 'none';
        startDateField.value = startDate ? formatDateForInput(startDate) : '';
        endDateField.value = endDate ? formatDateForInput(endDate) : '';
        startDateField.disabled = true;
        endDateField.disabled = true;
    }
}

// Format date for input fields (yyyy-MM-dd)
function formatDateForInput(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
}
// Fetch and render sales data
async function fetchSalesData(startDate, endDate) {
    try {
        const response = await fetch(`/admin/getFillterdSalesTable?startDate=${formatDateForInput(startDate)}&endDate=${formatDateForInput(endDate)}`, {
            method: "GET",
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();
        if (result.status) {
            console.log(result.orderData)
            renderTable(result.orderData || []);
        } else {
            displayNoDataMessage(result.message || "No data available.");
        }
    } catch (error) {
        console.error("Error fetching sales data:", error);
        displayNoDataMessage("Failed to load data.");
    }
}

// Render sales table with pagination
function renderTable(orders) {
    const tableBody = document.getElementById('productTableBody');
    const prevPageButton = document.getElementById('prevPage');
    const nextPageButton = document.getElementById('nextPage');
    const showingText = document.querySelector('.showing1-10Text');

    let currentPage = 1;
    const rowsPerPage = 10;

    function render() {
        tableBody.innerHTML = '';
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const paginatedOrders = orders.slice(start, end);

        if (paginatedOrders.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5">No data available</td></tr>';
        } else {
            paginatedOrders.forEach(order => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${new Date(order.orderDate).toLocaleString('en-IN')}</td>
                    <td>${order.orderId}</td>
                    <td>₹${order.total_Amt_WOT_Discount.toFixed(2)}</td>
                    <td>₹${order.discount.toFixed(2)}</td>
                    <td>₹${order.totalAmount.toFixed(2)}</td>
                `;
                tableBody.appendChild(tr);
            });
        }

        const totalPages = Math.ceil(orders.length / rowsPerPage);
        showingText.textContent = `Showing ${start + 1}-${Math.min(end, orders.length)} from ${orders.length}`;

        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = currentPage === totalPages;
    }

    prevPageButton.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            render();
        }
    };

    nextPageButton.onclick = () => {
        const totalPages = Math.ceil(orders.length / rowsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            render();
        }
    };

    render();
}

function displayNoDataMessage(message) {
    document.getElementById('productTableBody').innerHTML = `<tr><td colspan="5">${message}</td></tr>`;
}

// Generate report 
async function generateReport() {
    const startDateField = document.getElementById('startDate');
    const endDateField = document.getElementById('endDate');


    if(startDateField.value === "" || endDateField.value === ""){
        return showAlert('Please Enter the valid date','danger');
    }
    const startDate = new Date(startDateField.value);
    const endDate = new Date(endDateField.value);
    await fetchSalesData(startDate, endDate);
}

  
async function downloadPDFReport(startDate, endDate) {

    try {
        const response = await fetch(`/admin/downloadSalesPDF?startDate=${startDate}&endDate=${endDate}`,
             { method: 'GET' });

        if (!response.ok) {
            throw new Error(`Server returned ${response.status} - ${response.statusText}`);
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Sales_Report_${startDate}_to_${endDate}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();

        console.log('PDF downloaded successfully');
    } catch (error) {
        console.error('Error downloading the PDF report:', error);
    }
}


async function downloadExcelReport(startDate, endDate) {
    try {
        const response = await fetch(`/admin/downloadSalesEXCEl?startDate=${startDate}&endDate=${endDate}`,
             { method: 'GET' });
        if (!response.ok) {
            throw new Error(`Server returned ${response.status} - ${response.statusText}`);
        }
        const blob = await response.blob();

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Sales_Report_${startDate}_to_${endDate}.xlsx`; 
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        console.log('Excel report downloaded successfully');
    } catch (error) {
        console.error('Error downloading the Excel report:', error);
    }
}



  document.getElementById('downloadReportBtn').addEventListener('click', () => {
    const startDateField = document.getElementById('startDate');
    const endDateField = document.getElementById('endDate');
    const startDate = startDateField.value;
    const endDate = endDateField.value;
    if(startDateField.value === "" || endDateField.value === ""){
        return showAlert('Please Enter the valid date','danger');
    }
  
    downloadPDFReport(startDate, endDate);
  });

  document.getElementById('downloadReportBtnExcel').addEventListener('click', () => {
    const startDateField = document.getElementById('startDate');
    const endDateField = document.getElementById('endDate');
    const startDate = startDateField.value;
    const endDate = endDateField.value;
    if(startDateField.value === "" || endDateField.value === ""){
        return showAlert('Please Enter the valid date','danger');
    }

    downloadExcelReport(startDate, endDate);
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