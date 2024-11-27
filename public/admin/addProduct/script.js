



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


const alertBox = document.getElementById("alertBox");
  alertBox.classList.add("show");
  setTimeout(() => {
    alertBox.classList.remove("show");
    alertBox.classList.add("hide");
    setTimeout(() => {
      alertBox.style.display = "none";
    }, 500); 
  }, 3000); 


  if (window.location.search) {
    const url = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, url);
  }




