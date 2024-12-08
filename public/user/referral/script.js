function copyToClipboard(inputId, badgeId) {
  const inputElement = document.getElementById(inputId);
  const badge = document.getElementById(badgeId);

  // Select and copy the text
  inputElement.select();
  inputElement.setSelectionRange(0, 99999); // For mobile devices
  navigator.clipboard.writeText(inputElement.value).then(() => {
    // Show the specific badge
    badge.style.opacity = '1';
    badge.style.transform = 'translateY(-10px)';

    // Hide the badge after 2 seconds
    setTimeout(() => {
      badge.style.opacity = '0';
      badge.style.transform = 'translateY(0)';
    }, 2000);
  });
}
