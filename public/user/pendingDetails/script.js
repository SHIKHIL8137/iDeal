

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


document.addEventListener("DOMContentLoaded", () => {
  const repayButtons = document.querySelectorAll("button[data-order-id]");

  repayButtons.forEach(button => {
    button.addEventListener("click", async () => {
      const orderId = button.getAttribute("data-order-id");
      const razorPayOrderId = button.getAttribute("data-razorpay-order-id");
      const totalAmount = button.getAttribute("data-total-amount");
      const razorPayKey = button.getAttribute("data-razor-PayKey");

      const amountInPaise = parseInt(totalAmount, 10) * 100;
      if (!orderId || !razorPayOrderId || isNaN(amountInPaise) || amountInPaise <= 0) {
        showAlert("Invalid order details or amount. Please try again.", "danger");
        return;
      }

      try {
        const rzp = new Razorpay({
          key: razorPayKey,
          amount: amountInPaise,
          currency: "INR",
          order_id: razorPayOrderId,
          handler: async (razorpayResponse) => {
            try {
              const result = await fetch(`/user/verify-payment/${orderId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(razorpayResponse),
              }).catch(err => {
                console.error("Network Error:", err);
                showAlert("Network error while verifying payment. Please try again.", "danger");
                throw err;
              });

              const verificationResult = await result.json();
              if (verificationResult.success) {
                window.location.href = `/user/loadOrderConformation/${verificationResult.orderId}`;
              } else {
                showAlert(verificationResult.message || "Payment verification failed!", "danger");
              }
            } catch (err) {
              console.error("Verification Error:", err);
              showAlert("Error updating payment status. Please contact support.", "danger");
            }
          },
          theme: { color: "#3399cc" },
        });

        rzp.on("payment.failed", (response) => {
          console.error("Payment Failed Response:", response);
          showAlert("Payment failed. Please try again.", "danger");
        });

        rzp.open();
      } catch (error) {
        console.error("Razorpay Initialization Error:", error);
        showAlert("Error initializing payment. Please try again later.", "danger");
      }
    });
  });
});


function showAlert(message, type) {
  const existingAlert = document.getElementById('alertBox');
  if (existingAlert) existingAlert.remove();

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
