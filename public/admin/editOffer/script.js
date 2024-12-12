function toggleOfferFields() {
  const offerType = document.getElementById('applicableTo').value;
  const productFields = document.getElementById('productFields');
  const categoryFields = document.getElementById('categoryFields');
  
  if (offerType === 'Product') {
    productFields.style.display = 'block';
    categoryFields.style.display = 'none';
  } else if (offerType === 'Category') {
    productFields.style.display = 'none';
    categoryFields.style.display = 'block';
  } else {
    productFields.style.display = 'none';
    categoryFields.style.display = 'none';
  }
}
window.onload = toggleOfferFields;




document.getElementById('offerForm').addEventListener('submit', function(event) {
  event.preventDefault(); 


  let formIsValid = true;


  if (document.getElementById('applicableTo').value === "") {
    formIsValid = false;
    showError('applicableTo', 'Please select an offer type.');
  }


  if (document.getElementById('applicableTo').value === 'product') {
    if (document.getElementById('productSelect').value === "") {
      formIsValid = false;
      showError('productSelect', 'Please select a product.');
    }
  } else if (document.getElementById('applicableTo').value === 'category') {
    if (document.getElementById('categorySelect').value === "") {
      formIsValid = false;
      showError('categorySelect', 'Please select a category.');
    }
  }


  if (document.getElementById('title').value === "") {
    formIsValid = false;
    showError('title', 'Offer title is required.');
  }


  if (document.getElementById('description').value === "") {
    formIsValid = false;
    showError('description', 'Offer description is required.');
  }


  if (document.getElementById('discountValue').value === "" || document.getElementById('discountValue').value < 0) {
    formIsValid = false;
    showError('discountValue', 'Discount value must be a positive number.');
  }

 
  if (document.getElementById('minOrderAmount').value === "" || document.getElementById('minOrderAmount').value < 0) {
    formIsValid = false;
    showError('minOrderAmount', 'Minimum order amount must be a positive number.');
  }


  if (document.getElementById('validFrom').value === "") {
    formIsValid = false;
    showError('validFrom', 'Please select a valid from date.');
  }


  if (document.getElementById('validTill').value === "") {
    formIsValid = false;
    showError('validTill', 'Please select a valid till date.');
  }



  if (document.getElementById('isActive').value === "") {
    formIsValid = false;
    showError('isActive', 'Please select whether the offer is active or not.');
  }
  if (document.getElementById('discountCap').value === "" || document.getElementById('discountCap').value < 0) {
    formIsValid = false;
    showError('discountCap', 'Please Enter the Maximum Discount');
  }

  if (formIsValid) {
    console.log('submitted')
    document.getElementById('offerForm').submit();
  }
});


function showError(fieldId, message) {
  const errorDiv = document.getElementById(fieldId + 'Error');
  errorDiv.innerText = message;
  errorDiv.style.display = 'block';
  setTimeout(()=>{
    errorDiv.style.display = 'none';
  },5000)
}

