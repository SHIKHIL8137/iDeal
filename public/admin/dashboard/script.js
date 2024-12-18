const ctx = document.getElementById("revenueChart").getContext("2d");
const revenueChart = new Chart(ctx, {
  type: "bar",
  data: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
    datasets: [
      {
        label: "Profit",
        data: [100, 80, 90, 95, 85, 60, 70, 75, 85],
        backgroundColor: "#3b82f6", // Blue color
      },
      {
        label: "Loss",
        data: [60, 50, 30, 40, 70, 30, 40, 60, 50],
        backgroundColor: "#d1d5db", // Light gray color
      },
    ],
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (value) => value + "k" },
      },
    },
  },
});



async function fetchTopSellingProducts() {
  try {
    const response = await fetch("/admin/getTopSellingProduct");
    const data = await response.json();
    if (response.ok) {
      renderProgressBars(data.top5Products);
    } else {
      renderErrorMessage(data.message || "An error occurred while fetching data. Please refresh the page.");
    }
  } catch (error) {
    console.error("Error fetching top-selling products:", error);
    renderErrorMessage("An unexpected error occurred. Please refresh the page.");
  }
}


function renderProgressBars(products) {
  const container = document.querySelector(".progress-container");
  container.innerHTML = ""; // Clear existing content
  products.forEach(product => {
    const item = document.createElement("div");
    item.className = "item";
    item.innerHTML = `<span>${product.productName}</span><span>${Math.min(product.actualQuantity, 100)}%</span>`;
    
    const progressBar = document.createElement("div");
    progressBar.className = "progress-bar";
    const span = document.createElement("span");
    span.style.width = `${Math.min(product.actualQuantity, 100)}%`;
    progressBar.appendChild(span);

    container.appendChild(item);
    container.appendChild(progressBar);
  });
}

function renderErrorMessage(message) {
  const container = document.querySelector(".progress-container");
  container.innerHTML = ""; // Clear existing content
  const errorMessage = document.createElement("div");
  errorMessage.className = "error-message";
  errorMessage.style.color = "red";
  errorMessage.style.textAlign = "center";
  errorMessage.style.marginTop = "20px";
  errorMessage.textContent = message;
  container.appendChild(errorMessage);
}
fetchTopSellingProducts();

async function fetchMostSoldCategories() {
  try {
    const response = await fetch("/admin/getMostSoldCategories"); // Adjust the URL if needed
    const data = await response.json();

    if (response.ok) {
      renderTopSellingCategories(data.data); // Use the 'data' field from the response
    } else {
      renderErrorMessage(data.message || "An error occurred while fetching data. Please refresh the page.");
    }
  } catch (error) {
    console.error("Error fetching most sold categories:", error);
    renderErrorMessage("An unexpected error occurred. Please refresh the page.");
  }
}

function renderTopSellingCategories(categories) {
  const container = document.querySelector(".progress-containerCategory");
  container.innerHTML = ""; // Clear existing content

  // Check if categories data is empty
  if (categories.length === 0) {
    container.innerHTML = "<p>No top-selling categories available.</p>";
    return;
  }

  categories.forEach((category) => {
    // Calculate percentage of actual sales based on the highest sold category
    const percentage = (category.actualSold / categories[0].actualSold) * 100;

    // Create category items
    const categoryItem = document.createElement("div");
    categoryItem.classList.add("item");
    categoryItem.innerHTML = `<span>${category.categoryName}</span><span>${category.actualSold}</span>`; // Show actualSold as the number

    // Create progress bar
    const progressBar = document.createElement("div");
    progressBar.classList.add("progress-bar");
    // Assuming the highest actualSold is 100%
    progressBar.innerHTML = `<span style="width: ${percentage}%;"></span>`;

    // Append to container
    container.appendChild(categoryItem);
    container.appendChild(progressBar);
  });
}

function renderErrorMessage(message) {
  const container = document.querySelector(".progress-containerCategory");
  container.innerHTML = `<p class="error-message">${message}</p>`;
}

// Fetch the most sold categories when the page loads
fetchMostSoldCategories();



// for alert box
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