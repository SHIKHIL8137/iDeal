const queryParams = new URLSearchParams(window.location.search);
const message = queryParams.get('message');

document.addEventListener('DOMContentLoaded',() => {
  getOfferData();
  if(message){
    showAlert(message,'success');
  }
});

// DOM References
const table = document.getElementById('productTableBody');
const prevPageButton = document.getElementById('prevPage');
const nextPageButton = document.getElementById('nextPage');
const showingText = document.querySelector('.showing1-10Text');
const filterButtons = document.querySelectorAll('[data-filter]');

const rowsPerPage = 10;
let currentPage = 1;
let data = []; 
let filteredData = []; 



async function getOfferData(){
  try {
    const response = await fetch('/admin/getOfferTable', {
      method: 'GET',
    });

    const result = await response.json();
  console.log(result);
    if (result.status && Array.isArray(result.data)) {
      data = result.data;
      filteredData = data;

      renderTable(); 
      applyFilter('all'); 
    } else {
      table.innerHTML = `<tr><td colspan="7" class="text-center text-danger">No offers found.</td></tr>`;
    }
  } catch (error) {
    console.error('Error fetching offers:', error);
    table.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Failed to load offers.</td></tr>`;
  }
}







function renderTable() {
  table.innerHTML = "";

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, filteredData.length);

  if (filteredData.length === 0) {
    table.innerHTML = '<tr><td colspan="7" class="text-center text-danger">No offers found.</td></tr>';
    showingText.textContent = "Showing 0 from 0";
    prevPageButton.disabled = true;
    nextPageButton.disabled = true;
    return;
  }

  for (let i = startIndex; i < endIndex; i++) {
    const element = filteredData[i];

    const applicableName = element.applicableTo === 'Product'
      ? element.product?.name || 'N/A'
      : element.category?.name || 'N/A';

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${element.applicableTo}</td>
      <td>${applicableName}</td>
      <td>${element.discountValue}%</td>
      <td>
        <span class="badge ${element.isActive ? 'bg-success' : 'bg-danger'}">
          ${element.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td>${new Date(element.validFrom).toLocaleDateString('en-IN')}</td>
      <td>${new Date(element.validTill).toLocaleDateString('en-IN')}</td>
      <td>
        <button class="btn btn-outline-success" onclick="editOffer('${element._id}')">Edit</button>
        <button class="btn btn-outline-danger" onclick="showDeleteModal('${element._id}')">Delete</button>
      </td>
    `;
    table.appendChild(row);
  }

  showingText.textContent = `Showing ${startIndex + 1}-${endIndex} from ${filteredData.length}`;

  prevPageButton.disabled = currentPage === 1;
  nextPageButton.disabled = endIndex === filteredData.length;
}

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    const filter = button.getAttribute('data-filter');
    applyFilter(filter);
  });
});

prevPageButton.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderTable();
  }
});

nextPageButton.addEventListener('click', () => {
  if (currentPage < Math.ceil(filteredData.length / rowsPerPage)) {
    currentPage++;
    renderTable();
  }
});

function applyFilter(filter) {
  switch (filter) {
    case 'published':
      filteredData = data.filter(item => item.isActive);
      break;
    case 'lowstock':
      filteredData = data.filter(item => !item.isActive);
      break;
    default:
      filteredData = data;
  }

  currentPage = 1;
  renderTable();
  filterButtons.forEach(button => {
    button.classList.toggle('active', button.getAttribute('data-filter') === filter);
  });
}




function editOffer(id){
  console.log('clicked')
  window.location.href = `/admin/editOffer/${id}`
}


let selectedOfferId = null; 

function showDeleteModal(offerId) {
  selectedOfferId = offerId; 
  const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
  deleteModal.show(); 
}


document.getElementById('confirmDelete').addEventListener('click', async () => {
  if (selectedOfferId) {
    try {
      const response = await fetch(`/admin/offerDelete/${selectedOfferId}`, { method: 'DELETE' });
      const result = await response.json();

      if (result.status) {
        showAlert(result.message, 'success');
        

        const modalElement = document.getElementById('deleteModal');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) {
          modalInstance.hide();
        }
        getOfferData();
      } else {
        showAlert(result.message, 'danger');
      }
    } catch (error) {
      console.error("Error:", error);
      showAlert("An unexpected error occurred. Please try again.", 'danger');
    }
  }
});



document.getElementById('addProductbtn').addEventListener('click',()=>{
  window.location.href = '/admin/addOffer'
})



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

  // remove the params from the url
  if (window.location.search) {
    const url = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, url);
  }