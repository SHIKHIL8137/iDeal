function writeReview(productId) {

  window.currentProductId = productId;
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('reviewSubmitBtn').addEventListener('click', async (event) => {
    event.preventDefault();

    const rating = document.querySelector('input[name="rating"]:checked')?.value;
    const reviewText = document.getElementById('feedback').value;

    if (!rating || !reviewText) {
      alert('Please provide both a rating and a review.');
      return;
    }

    const reviewData = {
      rating: rating,
      reviewText: reviewText,
    };

    console.log(reviewData)

    try {

      const response = await fetch(`/user/productReview/${window.currentProductId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      if (response.ok) {
        const result = await response.text(); 
        showAlert(result,'success'); 

        const modal = bootstrap.Modal.getInstance(document.getElementById('reviewModal'));
        modal.hide();


        document.getElementById('feedback').value = ''; 
        document.querySelector('input[name="rating"]:checked').checked = false; 
      } else {
        const error = await response.text(); 
        showAlert(`Failed to submit review: ${error}`,'danger');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      showAlert('An error occurred while submitting your review.','danger');
    }
  });



document.querySelectorAll('.cancel-order-btn').forEach(button => {
  button.addEventListener('click', async (event) => {
    const orderId = event.target.getAttribute('data-order-id');

    const confirmCancel = confirm('Are you sure you want to cancel this order?');

    if (!confirmCancel) {
      return; 
    }
    try {
      const response = await fetch(`/user/cancel-order/${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok) {
        event.target.closest('.card').querySelector('.mb-0').textContent = 'Order has been cancelled';
        event.target.setAttribute('disabled', 'true');
        event.target.textContent = 'Order Cancelled';
        showAlert(result.message,'success'); 
      } else {
        showAlert(result.message,'danger'); 
      }
    } catch (error) {
      console.error(error);
      showAlert('Failed to cancel the order','danger');
    }
  });
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