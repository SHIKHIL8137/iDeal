
document.getElementById('cancelbtn').addEventListener('click',function(){
  window.location.href = `/admin/category`;
})

if (window.location.search) {
  const url = window.location.origin + window.location.pathname;
  window.history.replaceState({}, document.title, url);
}