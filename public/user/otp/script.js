document.addEventListener('DOMContentLoaded',()=>{
let email = JSON.parse(document.getElementById('userData').textContent);
const emailTextElement = document.getElementById('textArea');
const emailParts = email.split("@");
  const firstPart = emailParts[0];
  const domain = emailParts[1];
  const emailWithEllipsis = firstPart.substring(0, 3) + "...." + "@" + domain;
  emailTextElement.textContent = `otp code sent to ${emailWithEllipsis}`;
})

const btnAction = document.getElementById('btnResend');
    const timer = document.getElementById('timerCountNumber');
    const alertBox=document.getElementById('alertBox1');
    const alertBox1=document.getElementById('alertBox');

    let countdownInterval;
    let countdownValue = 10; 
    function startTimer() {
      btnAction.disabled = true;
      countdownValue = 10;
      timer.innerHTML = countdownValue; 

      countdownInterval = setInterval(() => {
        countdownValue--;
        timer.innerHTML = countdownValue;

        if (countdownValue <= 0) {
          clearInterval(countdownInterval); 
          btnAction.disabled = false; 
          timer.innerHTML = "0"; 
        }
      }, 1000);
    }

    btnAction.addEventListener('click', async()=>{
      btnAction.disabled = true;
      try {
        const response = await fetch('/user/resend-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        })
        if(response.ok){
          startTimer()  
          showBanner("OTP Resend successfuly")
        }else {
         showBanner("Failed to resend OTP Try again")
        }
      } catch (error) {
          console.error('Error:', error);
      alert('An error occurred while resending OTP.');
      }
    });
function showBanner(msg){
  alertBox.classList.add("show");
  alertBox.style.display = "block";
  alertBox.classList.remove("hide"); 
  alertBox.classList.add("show");
  alertBox.innerHTML=msg
  setTimeout(() => {
    alertBox.classList.remove("show");
    alertBox.classList.add("hide");
    setTimeout(() => {
      alertBox.style.display = "none";
    }, 500); 
  }, 3000);
}
    startTimer();





