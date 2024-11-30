// cancel action
document.getElementById('cancelbtn').addEventListener('click',function(){
  window.location.href = `/admin/category`;
})

// code modal conforming the change

document.getElementById('submitButton').addEventListener('click', function () {

  const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
  confirmationModal.show();
});

document.getElementById('confirmSubmit').addEventListener('click', function () {

  document.querySelector('form').submit();
});



// remove the params from the url
if (window.location.search) {
  const url = window.location.origin + window.location.pathname;
  window.history.replaceState({}, document.title, url);
}