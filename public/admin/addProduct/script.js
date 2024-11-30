// cancel teh adding product process
document.getElementById('cancelbtn').addEventListener('click',(e)=>{
  e.preventDefault()
  window.location.href = '/admin/product'
})


document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const errorMessages = document.querySelectorAll(".error-message");

  form.addEventListener("submit", (event) => {
    let isValid = true;

    // Clear all previous error messages
    errorMessages.forEach((error) => {
      error.textContent = "";
    });

    // Product Name Validation
    const productName = document.getElementById("productName");
    if (!productName.value.trim()) {
      setError(productName, "Product name is required.");
      isValid = false;
    }

    // Product Description Validation
    const productDescription = document.getElementById("productDescription");
    if (!productDescription.value.trim()) {
      setError(productDescription, "Product description is required.");
      isValid = false;
    }

    // Image Validation (at least one image required)
    const imageInputs = [
      document.getElementById('input1'),
      document.getElementById('input2'),
      document.getElementById('input3'),
      document.getElementById('input4'),
    ];
    imageInputs.forEach((input,ind)=>{
      if(input.files.length === 0){
        setError(imageInputs[ind],'This field is require')
        isValid = false;
      }
    })
    

    // Base Price Validation
    const basePrice = document.getElementById("basePrice");
    if (!basePrice.value.trim() || isNaN(basePrice.value) || Number(basePrice.value) <= 0) {
      setError(basePrice, "Base price must be a valid positive number.");
      isValid = false;
    }

    // Discount Validation
    const discount = document.getElementById("discountPercentage");
    if (!discount.value.trim() || isNaN(discount.value) || Number(discount.value) < 0) {
      setError(discount, "Discount must be a valid number (0 or higher).");
      isValid = false;
    }

    // Storage Validation
    const storage = document.getElementById("storageStatus");
    if (!storage.value) {
      setError(storage, "Please select a storage option.");
      isValid = false;
    }

    // Color Validation
    const color = document.getElementById("colorStatus");
    if (!color.value) {
      setError(color, "Please select a color.");
      isValid = false;
    }

    // Quantity Validation
    const quantity = document.getElementById("productQuantity");
    if (!quantity.value.trim() || isNaN(quantity.value) || Number(quantity.value) < 0) {
      setError(quantity, "Quantity must be a valid positive number.");
      isValid = false;
    }

    // Category Validation
    const category = document.getElementById("productCategory");
    if (!category.value) {
      setError(category, "Please select a category.");
      isValid = false;
    }

    // Condition Validation
    const condition = document.getElementById("productStatus");
    if (!condition.value) {
      setError(condition, "Please select a condition.");
      isValid = false;
    }

    // Connectivity Validation
    const connectivity = document.querySelector("select[name='connectivity']");
    if (!connectivity.value) {
      setError(connectivity, "Please select a connectivity type.");
      isValid = false;
    }

    // Prevent form submission if validation fails
    if (!isValid) {
      event.preventDefault();
    }
  });

  // Helper function to set error messages
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
});


// crop the images after uploading

function viewImage1(event){
  document.getElementById('imgView1').src=URL.createObjectURL(event.target.files[0])
}
function viewImage2(event){
  document.getElementById('imgView2').src=URL.createObjectURL(event.target.files[0])
}
function viewImage3(event){
  document.getElementById('imgView3').src=URL.createObjectURL(event.target.files[0])
}
function viewImage4(event){
  document.getElementById('imgView4').src=URL.createObjectURL(event.target.files[0])
}

function viewImage(event,index){
  let input=event.target;
  let reader=new FileReader();
  reader.onload=function(){
    let dataURL =reader.result;
    let image=document.getElementById('imgView'+index);
    image.src=dataURL;
    let cropper=new Cropper(image,{
      aspectRatio:NaN,
      viewMode:1,
      guides:true,
      background:false,
      autoCropArea:1,
      Zoomable:true
    });

    let cropperContainer = document.querySelector('#croppedImg'+index).parentNode;
    cropperContainer.style.width='100px'
    cropperContainer.style.display='block';

    let saveButton = document.querySelector('#saveButton'+index);
   
    saveButton.addEventListener('click',async function (){
       document.getElementById('imgView1').style.display='none'
        document.getElementById('imgView2').style.display='none'
         document.getElementById('imgView3').style.display='none'
          document.getElementById('imgView4').style.display='none'
      let croppedCanvas=cropper.getCroppedCanvas();
      let croppedImage = document.getElementById('croppedImg'+index);
      croppedImage.src = croppedCanvas.toDataURL('image/jpeg',1.0);

      let timestamp = new Date().getTime();
      let fileName = `cropped-img-${timestamp}-${index}.png`;

      await croppedCanvas.toBlob(blob=>{
        let input = document.getElementById('input'+index);
        let imgFile = new File([blob],fileName,blob)
        const fileList = new DataTransfer();
        fileList.items.add(imgFile);
        input.files = fileList.files
      });
      cropperContainer.style.display = 'none';
      cropper.destroy();
    });
  };
  reader.readAsDataURL(input.files[0]);
}

// alert box
const alertBox = document.getElementById("alertBox");
  alertBox.classList.add("show");
  setTimeout(() => {
    alertBox.classList.remove("show");
    alertBox.classList.add("hide");
    setTimeout(() => {
      alertBox.style.display = "none";
    }, 500); 
  }, 3000); 



  // remove the params from the url
  if (window.location.search) {
    const url = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, url);
  }




