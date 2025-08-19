function validateField(field, errorElement, condition, errorMessage) {
  if (condition) {
      errorElement.textContent = errorMessage;
      errorElement.classList.remove('d-none');
      field.addEventListener('input', () => errorElement.classList.add('d-none'), { once: true });
      return false;
  }
  return true;
}

function validation() {
  let isValid = true;

  const couponCode = document.getElementById('couponCode');
  const couponCodeError = document.getElementById('couponCodeError');
  isValid &= validateField(
      couponCode,
      couponCodeError,
      couponCode.value.trim() === '',
      'Coupon code is required.'
  );

  const description = document.getElementById('description');
  const descriptionError = document.getElementById('descriptionError');
  isValid &= validateField(
      description,
      descriptionError,
      description.value.trim() === '',
      'Description is required.'
  );

  const discountPercentage = document.getElementById('discountPercentage');
  const discountPercentageError = document.getElementById('discountPercentageError');
  isValid &= validateField(
      discountPercentage,
      discountPercentageError,
      isNaN(discountPercentage.value) || discountPercentage.value < 1 || discountPercentage.value > 100,
      'Discount percentage must be between 1 and 100.'
  );

// Maximum Discount Validation
const maximumDiscount = document.getElementById('maximumDiscount');
const maximumDiscountError = document.getElementById('maximumDiscountError');
isValid &= validateField(
    maximumDiscount,
    maximumDiscountError,
    isNaN(maximumDiscount.value) || maximumDiscount.value <= 0 || maximumDiscount.value > 100000,
    'Maximum discount must be greater than 0 and cannot exceed 1,00,000.'
);

// Minimum Purchase Validation
const minimumPurchase = document.getElementById('minimumPurchase');
const minimumPurchaseError = document.getElementById('minimumPurchaseError');
isValid &= validateField(
    minimumPurchase,
    minimumPurchaseError,
    isNaN(minimumPurchase.value) || minimumPurchase.value <= 0 || minimumPurchase.value > 100000,
    'Minimum purchase amount must be greater than 0 and cannot exceed 1,00,000.'
);


  const startDate = document.getElementById('startDate');
  const startDateError = document.getElementById('startDateError');
  isValid &= validateField(
      startDate,
      startDateError,
      startDate.value.trim() === '',
      'Start date is required.'
  );


  const endDate = document.getElementById('endDate');
  const endDateError = document.getElementById('endDateError');
  isValid &= validateField(
      endDate,
      endDateError,
      endDate.value.trim() === '' || new Date(endDate.value) < new Date(startDate.value),
      'End date must be after the start date.'
  );

  const usageLimit = document.getElementById('usageLimit');
  const usageLimitError = document.getElementById('usageLimitError');
  isValid &= validateField(
      usageLimit,
      usageLimitError,
      isNaN(usageLimit.value) || usageLimit.value <= 0 || usageLimit.value > 1000,
      'Usage limit must be greater than 0 and less than 1000'
  );

  if (isValid) {
      const data = {
          code: couponCode.value,
          description: description.value,
          discountPercentage: discountPercentage.value,
          maxDiscountAmount: maximumDiscount.value,
          minOrderAmount: minimumPurchase.value,
          validFrom: startDate.value,
          validTill: endDate.value,
          usageLimit: usageLimit.value,
      };
      submitData(data);
  }
}

async function submitData(data) {

  const submitButton = document.getElementById('submitButton');
  submitButton.disabled = true; 
  submitButton.textContent = 'Adding...'
  try {
      const response = await fetch('/admin/addCoupon', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.status) {
          showAlert(result.message, 'success');
          clearData();
      } else {
          showAlert(result.message, 'danger');
      }
  } catch (error) {
      showAlert('An error occurred. Please try again later.', 'danger');
  } finally {
      submitButton.disabled = false; 
      submitButton.textContent ='Add Coupon';
  }
}

function clearData() {
  document.getElementById('couponCode').value = '';
  document.getElementById('description').value = '';
  document.getElementById('discountPercentage').value = '';
  document.getElementById('maximumDiscount').value = '';
  document.getElementById('minimumPurchase').value = '';
  document.getElementById('startDate').value = '';
  document.getElementById('endDate').value = '';
  document.getElementById('usageLimit').value = '';
}

function showAlert(message, type) {
  const alertBox = document.getElementById('alertBox');
  alertBox.innerHTML = message;
  alertBox.className = `alert alert-${type} show`;
  setTimeout(() => {
      alertBox.className = `alert alert-${type} hide`;
  }, 3000);
}
