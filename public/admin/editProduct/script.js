document.querySelectorAll('.delete-icon').forEach(icon => {
  icon.addEventListener('click', (e) => {
    const imageItem = e.target.closest('.image-item');
    imageItem.remove(); 
  });
});



//delete the image action

function deleteImage(productId, index) {
  fetch(`/admin/deleteProductImage/${productId}/${index}`, { method: 'DELETE' })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        location.reload(); // Refresh to update the UI
      } else {
        alert('Failed to delete image');
      }
    })
    .catch(err => console.error('Error:', err));
}


// showing the remaing upload image slot

document.addEventListener('DOMContentLoaded', function () {
  const maxImages = 4; 
  const existingImagesCount = document.querySelectorAll('.image-item').length; 
  const remainingSlots = maxImages - existingImagesCount; 


  for (let i = 1; i <= remainingSlots; i++) {
    document.getElementById(`input${i}`).style.display = "block";
  }

  for (let i = remainingSlots + 1; i <= maxImages; i++) {
    document.getElementById(`input${i}`).style.display = "none";
  }
});




function viewImage(event, index) {
  const input = event.target;
  const reader = new FileReader();

  reader.onload = function () {
    const dataURL = reader.result;


    const image = document.getElementById(`imgView${index}`);
    image.src = dataURL;
    image.style.display = 'block';


    const cropper = new Cropper(image, {
      aspectRatio: NaN, 
      viewMode: 1,
      guides: true,
      background: false,
      autoCropArea: 1,
      zoomable: true,
    });

    const cropperContainer = document.getElementById(`croppedImg${index}`).parentNode;
    cropperContainer.style.display = 'block';
    

    const saveButton = document.getElementById(`saveButton${index}`);
    saveButton.addEventListener('click', async function () {
      image.style.display = 'none';
      const croppedCanvas = cropper.getCroppedCanvas();
      const croppedImage = document.getElementById(`croppedImg${index}`);
      croppedImage.src = croppedCanvas.toDataURL('image/jpeg', 1.0);

      const timestamp = new Date().getTime();
      const fileName = `cropped-img-${timestamp}-${index}.png`;

      await croppedCanvas.toBlob((blob) => {
        const imgFile = new File([blob], fileName, { type: blob.type });
        const inputElement = document.getElementById(`image${index}`);
        const fileList = new DataTransfer();
        fileList.items.add(imgFile);
        inputElement.files = fileList.files;
      });

      cropperContainer.style.display = 'none';
      cropper.destroy();
    });
  };

  reader.readAsDataURL(input.files[0]);
}


const errorMessages = document.querySelectorAll(".error-message");
document.getElementById('submitButton').addEventListener('click', function (e) {


  e.preventDefault(); 
      let isValid = true;
      errorMessages.forEach((error) => {
        error.textContent = "";
      });


      const productName = document.getElementById("productName");
      if (!productName.value.trim()) {
        setError(productName, "Product Name is required.");
        isValid = false;
      } 

      let imageCount = 0;
      const displayedImages = document.querySelectorAll(".uploaded-images .image-item").length;
      const fileInputs = document.querySelectorAll("input[type='file']");
    

    fileInputs.forEach(input => {
      if (input.files.length > 0) {
        imageCount++;
      }
    });
    const newimages = document.getElementById("new-images");
    if (displayedImages + imageCount !== 4) {
      setError(newimages, "You must upload exactly 4 images.")
      isValid = false;
    } 

      const productDescription = document.getElementById("productDescription");
      if (!productDescription.value.trim()) {
        setError(productDescription, "Description is required.");
        isValid = false;
      } 


      const basePrice = document.getElementById("basePrice");
      if (!basePrice.value.trim() || basePrice.value <= 0) {
        setError(basePrice, "Base price must be a positive number.");
        isValid = false;
      } 


      const discountPercentage = document.getElementById("discountPercentage");
      if (
        !discountPercentage.value.trim() ||
        discountPercentage.value < 0 ||
        discountPercentage.value > 100
      ) {
        setError(discountPercentage, "Discount must be between 0 and 100.");
        isValid = false;
      }

      const storageStatus = document.getElementById("storageStatus");
      if (!storageStatus.value.trim()) {
        setError(storageStatus, "Please select a storage option.");
        isValid = false;
      } 


      const colorStatus = document.getElementById("colorStatus");
      if (!colorStatus.value.trim()) {
        setError(colorStatus, "Please select a color.");
        isValid = false;
      } 


      const productQuantity = document.getElementById("productQuantity");
      if (!productQuantity.value.trim() || productQuantity.value <= 0) {
        setError(productQuantity, "Quantity must be a positive number.");
        isValid = false;
      }


      const productCategory = document.getElementById("productCategory");
      if (!productCategory.value.trim()) {
        setError(productCategory, "Please select a category.");
        isValid = false;
      }


      const productCondition = document.getElementById("productStatus");
      if (!productCondition.value.trim()) {
        setError(productCondition, "Please select a condition.");
        isValid = false;
      }


      const connectivity = document.getElementById("productStatus");
      if (!connectivity.value.trim()) {
        setError(connectivity, "Please select a connectivity option.");
        isValid = false;
      }

      if (isValid) {
        const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
        confirmationModal.show();
      }
});

document.getElementById('confirmSubmit').addEventListener('click', function () {

  document.querySelector('form').submit();
});

// cancel the edit
document.getElementById('cancelbtn').addEventListener('click',(e)=>{
  e.preventDefault()
  window.location.href = '/admin/product'
})

function setError(input, message) {
  const errorContainer = input.nextElementSibling;
  if (errorContainer && errorContainer.classList.contains("error-message")) {
    errorContainer.style.color = 'red';
    errorContainer.textContent = message;
    setTimeout(()=>{
      errorContainer.textContent='';
    },5000);
  }
}



