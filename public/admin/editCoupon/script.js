
function validation(coupenId){
  let isValid = true;

  function validateField(field, errorElement, condition) {
      if (condition) {
          errorMessage(errorElement);
          isValid = false;
      }
  }

  const couponCode = document.getElementById('couponCode');
  const couponCodeError = document.getElementById('couponCodeError');
  validateField(couponCode, couponCodeError, couponCode.value.trim() === '');

  const description = document.getElementById('description');
  const descriptionError = document.getElementById('descriptionError');
  validateField(description, descriptionError, description.value.trim() === '');

  const discountPercentage = document.getElementById('discountPercentage');
  const discountPercentageError = document.getElementById('discountPercentageError');
  validateField(
      discountPercentage,
      discountPercentageError,
      isNaN(discountPercentage.value) || discountPercentage.value < 1 || discountPercentage.value > 100
  );

  const maximumDiscount = document.getElementById('maximumDiscount');
  const maximumDiscountError = document.getElementById('maximumDiscountError');
  validateField(
      maximumDiscount,
      maximumDiscountError,
      isNaN(maximumDiscount.value) || maximumDiscount.value <= 0
  );

  const minimumPurchase = document.getElementById('minimumPurchase');
  const minimumPurchaseError = document.getElementById('minimumPurchaseError');
  validateField(
      minimumPurchase,
      minimumPurchaseError,
      isNaN(minimumPurchase.value) || minimumPurchase.value <= 0
  );

  const startDate = document.getElementById('startDate');
  const startDateError = document.getElementById('startDateError');
  validateField(startDate, startDateError, startDate.value.trim() === '');

  const endDate = document.getElementById('endDate');
  const endDateError = document.getElementById('endDateError');
  validateField(
      endDate,
      endDateError,
      endDate.value.trim() === '' || new Date(endDate.value) < new Date(startDate.value)
  );

  const usageLimit = document.getElementById('usageLimit');
  const usageLimitError = document.getElementById('usageLimitError');
  validateField(usageLimit, usageLimitError, isNaN(usageLimit.value) || usageLimit.value <= 0);

  const statusField = document.getElementById('couponStatus');
  const statusError = document.getElementById('couponStatusError');
  validateField(statusField, statusError, !statusField.value);

  if (isValid) {
      const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
      confirmModal.show();

      const confirmSaveBtn = document.getElementById('confirmSaveBtn');
      confirmSaveBtn.addEventListener(
          'click',
          function () {
              // Create the data object
              const data = {
                  code: couponCode.value,
                  description: description.value,
                  discountPercentage: discountPercentage.value,
                  maxDiscountAmount: maximumDiscount.value,
                  minOrderAmount: minimumPurchase.value,
                  validFrom: startDate.value,
                  validTill: endDate.value,
                  usageLimit: usageLimit.value,
                  status: statusField.value,
              };
              submitData(data,coupenId);
              confirmModal.hide();
          },
          { once: true }
      );
  }

}

 

function errorMessage(errorElement) {
  errorElement.classList.remove('d-none');
  setTimeout(() => {
      errorElement.classList.add('d-none');
  }, 3000);
}

async function submitData(data,coupenId) {
  try {
      const response = await fetch(`/admin/editCoupon/${coupenId}`, {
          method: "POST",
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.status) {
          showAlert(result.message, 'success');
          populateData(result.data);
      } else {
          showAlert(result.message, 'danger');
      }
  } catch (error) {
      showAlert('An error occurred, please try again later', 'danger');
  }
}

function showAlert(message, type) {
  const alertBox = document.getElementById('alertBox');
  alertBox.innerHTML = message;
  alertBox.className = `alert alert-${type} show`;
  setTimeout(() => {
      alertBox.className = `alert alert-${type} hide`;
  }, 3000);
}

function populateData(data) {
  const formattedValidFrom = data.validFrom ? new Date(data.validFrom).toISOString().split('T')[0] : '';
  const formattedValidTill = data.validTill ? new Date(data.validTill).toISOString().split('T')[0] : '';
  document.getElementById('couponCode').value = data.code || '';
  document.getElementById('description').value = data.description || '';
  document.getElementById('discountPercentage').value = data.discountPercentage || '';
  document.getElementById('maximumDiscount').value = data.maxDiscountAmount || '';
  document.getElementById('minimumPurchase').value = data.minOrderAmount || '';
  document.getElementById('startDate').value = formattedValidFrom || '';
  document.getElementById('endDate').value = formattedValidTill || '';
  document.getElementById('usageLimit').value = data.usageLimit || '';
  document.getElementById('couponStatus').value = data.isActive ? 'true' : 'false';
  document.getElementById('usageCount').value = data.usersUsed ? data.usersUsed.length : 0;
}

