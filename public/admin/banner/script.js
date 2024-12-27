document.addEventListener('DOMContentLoaded',fetchBanners());

let cropper;
let currentTarget;

document.getElementById('offerBannerInput').addEventListener('change', function (event) {
    handleFileInput(event, 'offer');
});

document.getElementById('homePageBannerInput').addEventListener('change', function (event) {
    handleFileInput(event, 'home');
});

function handleFileInput(event, target) {
    const file = event.target.files[0];
    if (file) {
        currentTarget = target;
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('cropperImage').src = e.target.result;
            const modal = new bootstrap.Modal(document.getElementById('cropperModal'));
            modal.show();
            initializeCropper();
        };
        reader.readAsDataURL(file);
    }
}

function initializeCropper() {
    const image = document.getElementById('cropperImage');
    if (cropper) cropper.destroy();
    cropper = new Cropper(image, {
        aspectRatio: 8/2.5,
        viewMode: 1,
    });
}

document.getElementById('cropImageBtn').addEventListener('click', async function () {
  const canvas = cropper.getCroppedCanvas();
  if (canvas) {
      const croppedImage = await fetch(canvas.toDataURL('image/jpeg')).then(res => res.blob());
      
      const formData = new FormData();
      const bannerType = currentTarget === 'offer' ? 'offer' : 'home'; // Determine banner type
      formData.append('banner_image', croppedImage, `${bannerType}-banner.jpg`); // Use consistent field name
      formData.append('bannerType', bannerType); // Add banner type

      try {
          const response = await fetch('/admin/upload-banners', {
              method: 'POST',
              body: formData,
          });

          const data = await response.json();

          if (response.ok && data.success) {
              // Update the banner on success
              const imgElement = currentTarget === 'offer'
                  ? document.getElementById('currentOfferBanner')
                  : document.getElementById('homePageBanner');
              imgElement.src = data.filePath; // Update the image source
          } else {
              console.error('Upload failed:', data.error || 'Unknown error');
              alert('Failed to upload the image.');
          }
      } catch (error) {
          console.error('Error during image upload:', error);
          alert('An error occurred while uploading the image.');
      }

      // Close the modal and clean up the cropper
      const modal = bootstrap.Modal.getInstance(document.getElementById('cropperModal'));
      modal.hide();
      cropper.destroy();
  }
});


async function fetchBanners() {
  try {
      const response = await fetch('/admin/getbanners');
      const data = await response.json();

      if (response.ok && data.success) {
          const { home_image, offer_banner } = data.data;

          if (home_image) {
              document.getElementById('homePageBanner').src = home_image;
          }
          if (offer_banner) {
              document.getElementById('currentOfferBanner').src = offer_banner;
          }
      } else {
          console.error('Failed to fetch banners:', data.error || 'Unknown error');
      }
  } catch (error) {
      console.error('Error fetching banners:', error);
  }
}