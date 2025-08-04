document.addEventListener('keydown', (e) => {
  if ((e.key === 'F5') || (e.ctrlKey && e.key === 'r')) {
    e.preventDefault();
    showAlert('Page reload is disabled.', 'warning');
  }
});



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



window.onload = () => {
  const orderId = document.getElementById('orderId').value; 
  const initialTimerValue = 5; 
  let secondsLeft = initialTimerValue;

  const countdownElement = document.getElementById('timer');
  countdownElement.textContent = secondsLeft;

  const timer = setInterval(() => {
    secondsLeft -= 1;
    countdownElement.textContent = secondsLeft;

    if (secondsLeft <= 0) {
      clearInterval(timer);

      fetch(`/user/expireOrder/${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => {
          if (response.ok) {
            console.log('Order status updated to expired.');
            showAlert('Page expired! Redirecting to Order History.', 'success');

            setTimeout(() => {
              window.location.href = '/user/orderHistory';
            }, 4000);
          } else {
            console.error('Failed to update order status.');
            showAlert('Error: Failed to update order status.', 'danger');
          }
        })
        .catch((error) => {
          console.error('Error sending expire request:', error);
          showAlert('Network error occurred. Please try again.', 'danger');
        });
    }
  }, 1000);
};


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


