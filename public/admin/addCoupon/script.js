document.getElementById('couponForm').addEventListener('submit', function (event) {
  event.preventDefault(); 
  let isValid = true;

  const couponCode = document.getElementById('couponCode');
  const couponCodeError = document.getElementById('couponCodeError');
  if (couponCode.value.trim() === '') {
      errorMessage(couponCodeError)
      isValid = false;
  } 


  const description = document.getElementById('description');
  const descriptionError = document.getElementById('descriptionError');
  if (description.value.trim() === '') {
      errorMessage(descriptionError)
      isValid = false;
  } 

  const discountPercentage = document.getElementById('discountPercentage');
  const discountPercentageError = document.getElementById('discountPercentageError');
  if (discountPercentage.value < 1 || discountPercentage.value > 100) {
      errorMessage(discountPercentageError)
      isValid = false;
  }

  const maximumDiscount = document.getElementById('maximumDiscount');
  const maximumDiscountError = document.getElementById('maximumDiscountError');
  if (maximumDiscount.value <= 0) {
      errorMessage(maximumDiscountError)
      isValid = false;
  }

  const minimumPurchase = document.getElementById('minimumPurchase');
  const minimumPurchaseError = document.getElementById('minimumPurchaseError');
  if (minimumPurchase.value <= 0) {
    errorMessage(minimumPurchaseError)
      isValid = false;
  }

  const startDate = document.getElementById('startDate');
  const startDateError = document.getElementById('startDateError');
  if (startDate.value.trim() === '') {
      errorMessage(startDateError)
      isValid = false;
  }

  const endDate = document.getElementById('endDate');
  const endDateError = document.getElementById('endDateError');
  if (endDate.value.trim() === '' || endDate.value < startDate.value) {
    errorMessage(endDateError)
      isValid = false;
  }
  const usageLimit = document.getElementById('usageLimit');
  const usageLimitError = document.getElementById('usageLimitError');
  if (usageLimit.value <= 0) {
    errorMessage(usageLimitError)
      isValid = false;
  }
  if (isValid) {
      this.submit();
  }
});

function errorMessage(errorElement){
errorElement.classList.remove('d-none');
setTimeout(()=>{
  errorElement.classList.add('d-none');
},3000)
}
