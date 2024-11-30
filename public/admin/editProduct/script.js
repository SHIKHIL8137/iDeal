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



//show ing the images in the data base
function viewImage(event, index) {
  const input = event.target;
  const reader = new FileReader();

  reader.onload = function () {
    const dataURL = reader.result;

    // Show the preview image
    const image = document.getElementById(`imgView${index}`);
    image.src = dataURL;
    image.style.display = 'block';

    // Initialize Cropper.js
    const cropper = new Cropper(image, {
      aspectRatio: NaN, 
      viewMode: 1,
      guides: true,
      background: false,
      autoCropArea: 1,
      zoomable: true,
    });

    // Show crop container
    const cropperContainer = document.getElementById(`croppedImg${index}`).parentNode;
    cropperContainer.style.display = 'block';
    
    // Save cropped image
    const saveButton = document.getElementById(`saveButton${index}`);
    saveButton.addEventListener('click', async function () {
      image.style.display = 'none';
      const croppedCanvas = cropper.getCroppedCanvas();
      const croppedImage = document.getElementById(`croppedImg${index}`);
      croppedImage.src = croppedCanvas.toDataURL('image/jpeg', 1.0);

      // Create a new file from the cropped image
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

// code modal conforming the change

document.getElementById('submitButton').addEventListener('click', function () {

  const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
  confirmationModal.show();
});

document.getElementById('confirmSubmit').addEventListener('click', function () {

  document.querySelector('form').submit();
});

// cancel the edit
document.getElementById('cancelbtn').addEventListener('click',(e)=>{
  e.preventDefault()
  window.location.href = '/admin/product'
})



