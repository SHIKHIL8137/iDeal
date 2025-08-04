

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



document.addEventListener('DOMContentLoaded', function () {
  transactionTable();
});

async function transactionTable(){
  try{
    const response = await fetch('/user/getTransactionTable');
    console.log(response);
    if(!response.ok) throw Error('Error fetching the transaction data please refresh the page');

    const result = await response.json();

    if(result.status){
      renderTransactions(result.transactions,result.balance);
      window.transactions = result.transactions;
      window.balance = result.balance;
    }else{

      showAlert('An Error occure to fetch the transaction details','danger');
    }
  }catch(error){
    showAlert('Error occure','danger');
  }
  
}


  
  const rowsPerPage = 5;
  let currentPage = 1;

  const transactionTableBody = document.getElementById('transactionTableBody');
  const showingText = document.getElementById('showingText');
  const prevPageBtn = document.getElementById('prevPage');
  const nextPageBtn = document.getElementById('nextPage');

  function renderTransactions(transactions,balance) {
    const balanceField = document.getElementById('walletBalance');
    balanceField.textContent = `₹${balance.toFixed(2)}` ;
    console.log(transactions)
    transactionTableBody.innerHTML = '';
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, transactions.length);
    const currentTransactions = transactions.slice(startIndex, endIndex);
    currentTransactions.forEach((transaction) => {
      const row = `
        <tr>
          <td>${transaction.id}</td>
          <td>${transaction.date}</td>
          <td>
            <span class="${transaction.withdrawal !== '-' ? 'text-danger' : ''}">
            ${transaction.withdrawal}
            </span>
          </td>
          <td>
          <span class="${transaction.deposit !== '-' ? 'text-success' : ''}">
            ${transaction.deposit}
          </span>
          </td>
        </tr>
      `;
      transactionTableBody.insertAdjacentHTML('beforeend', row);
    });

    showingText.textContent = `Showing ${startIndex + 1}-${endIndex} of ${transactions.length}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === Math.ceil(transactions.length / rowsPerPage);
  }

  prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderTransactions(window.transactions, window.balance);
    }
  });
  
  nextPageBtn.addEventListener('click', () => {
    if (currentPage < Math.ceil(window.transactions.length / rowsPerPage)) {
      currentPage++;
      renderTransactions(window.transactions, window.balance);
    }
  });




document.getElementById('addMoneyForm').addEventListener('submit', function (event) {
  event.preventDefault(); 

  let isValid = true;

  const amount = document.getElementById('amount');
  const amountError = document.getElementById('amountError');

  if (amount.value.trim() === '' || parseFloat(amount.value) <= 0) {
    showErrorMessage(amountError);
    isValid = false;
  } else {
    amountError.classList.add('d-none');
  }

  if (isValid) {
    addMoneyToWallet(amount.value); 
  }
});

// Function to show error message
function showErrorMessage(errorElement) {
  errorElement.classList.remove('d-none');
  setTimeout(() => {
    errorElement.classList.add('d-none');
  }, 3000);
}

// Function to add money to the wallet using Fetch
async function addMoneyToWallet(amount) {
  try {
    const response = await fetch('/user/addToWallet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    });

    const result = await response.json();

    if (result.status) {
      showAlert(result.message || "Money added successfully!",'success');
      const addMoneyModal = bootstrap.Modal.getInstance(
        document.getElementById("addMoneyModal")
      );
      addMoneyModal.hide();
      transactionTable()
      document.getElementById('amount').value = '';
    } else {
      showAlert(result.message || "Failed to add money to wallet",'danger');
    }
  } catch (error) {
    console.error("Error adding money to wallet:", error);
    showAlert("An error occurred while adding money to the wallet.",'danger');
  }
}


function showAlert(message, type) {
  const alertBox = document.getElementById('alertBox');
  if (!alertBox) {
    console.error('Alert box element not found!');
    return;
  }

  alertBox.innerHTML = message;
  alertBox.className = `alert alert-${type} show`;


  const timeout = Math.max(3000, message.length * 100); 
  setTimeout(() => {
    alertBox.className = `alert alert-${type} hide`;
  }, timeout);
}