



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

  const largestQuantity = products.reduce((acc, product) => {
    return product.actualQuantity > acc ? product.actualQuantity : acc;
  }, 0);

  const container = document.querySelector(".progress-container");
  container.innerHTML = ""; 
console.log(products)
  products.forEach(product => {
    const item = document.createElement("div");
    item.className = "item";
    const percentage = Math.round((product.actualQuantity / largestQuantity) * 100);
    console.log('hrllo',percentage);
    console.log(product.actualQuantity);
    console.log(largestQuantity);
    item.innerHTML = `<span>${product.productName}</span><span>${percentage}%</span>`;
    const progressBar = document.createElement("div");
    progressBar.className = "progress-bar";
    const span = document.createElement("span");
    span.style.width = `${percentage}%`;
    progressBar.appendChild(span);
    container.appendChild(item);
    container.appendChild(progressBar);
  });
}


function renderErrorMessage(message) {
  const container = document.querySelector(".progress-container");
  container.innerHTML = "";
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
    const response = await fetch("/admin/getMostSoldCategories"); 
    const data = await response.json();

    if (response.ok) {
      renderTopSellingCategories(data.data); 
    } else {
      renderErrorMessage(data.message || "An error occurred while fetching data. Please refresh the page.");
    }
  } catch (error) {
    console.error("Error fetching most sold categories:", error);
    renderErrorMessage("An unexpected error occurred. Please refresh the page.");
  }
}

function renderTopSellingCategories(categories) {
  const largestQuantity = categories.reduce((acc, product) => {
    return product.actualSold > acc ? product.actualSold : acc;
  }, 0);


  const container = document.querySelector(".progress-containerCategory");
  container.innerHTML = "";


  if (categories.length === 0) {
    container.innerHTML = "<p>No top-selling categories available.</p>";
    return;
  }

  categories.forEach((category) => {
    const percentage = Math.round((category.actualSold / largestQuantity) * 100);
    const categoryItem = document.createElement("div");
    categoryItem.classList.add("item");
    categoryItem.innerHTML = `<span>${category.categoryName}</span><span>${percentage}%</span>`; 
    const progressBar = document.createElement("div");
    progressBar.classList.add("progress-bar");

    progressBar.innerHTML = `<span style="width: ${percentage}%;"></span>`;


    container.appendChild(categoryItem);
    container.appendChild(progressBar);
  });
}

function renderErrorMessage(message) {
  const container = document.querySelector(".progress-containerCategory");
  container.innerHTML = `<p class="error-message">${message}</p>`;
}


fetchMostSoldCategories();



async function fetchTodaysRevenue() {
  try {
    const response = await fetch('/admin/getDailyRevenue');
    const data = await response.json();
    console.log(data);
    if (data.success) {
      const totalRevenue = parseFloat(data.totalRevenue.replace('₹', '')); 
      const revenuePercentage = Math.min((totalRevenue / 100000) * 100, 100); 

      document.getElementById('revenue-circle').style.setProperty('--value', revenuePercentage);
      document.getElementById('revenue-percentage').textContent = `${Math.round(revenuePercentage)}%`;
      document.getElementById('revenue-amount').textContent = `₹${totalRevenue.toLocaleString()}`;
    } else {
      console.error(data.message);
    }
  } catch (error) {
    console.error('Error fetching today\'s revenue:', error);
  }
}


fetchTodaysRevenue();


async function featchUserCount(){
  try {
    const response = await fetch('/admin/getUserCount');
    const data = await response.json();
    if(data.success){
      const countPercentage = Math.min((data.userCount / 100) * 100, 100);
      console.log(countPercentage);
      document.getElementById('userCount').innerHTML = data.userCount;
      document.querySelector('.circle-userCount').style.setProperty('--value',countPercentage);
    }else {
      document.getElementById('userCount').innerHTML = 'Error to feaching the data';
    }
  } catch (error) {
    document.getElementById('userCount').innerHTML = 'Error to feaching the data';
  }
}



featchUserCount();



async function feachSales(){
  try{
    const response = await fetch('/admin/getTodaySales');
    const data = await response.json();
    if(data.success){
      const countPercentage = Math.min((data.totalAmount / 1000000) * 100, 100);
      document.getElementById('totalAmount').innerHTML = data.totalAmount;
      document.getElementById('itemCount').innerHTML = data.totalSalesCount;
      document.querySelector('.circle-todaySales').style.setProperty('--value',countPercentage);
    }else {
      document.getElementById('itemCount').innerHTML = 'Error to feaching the data';
    }
  }catch(error){
    document.getElementById('itemCount').innerHTML = 'Error to feaching the data';
  }
}


feachSales();

function toggleMonthInput() {
  const filterType = document.getElementById("filterType").value;
  const monthInput = document.getElementById("monthInput");
  const monthLabel = document.querySelector("label[for='monthInput']");

  if (filterType === "monthly") {
    monthInput.style.display = "inline"; 
    monthLabel.style.display = "inline"; 
  } else {
    monthInput.style.display = "none"; 
    monthLabel.style.display = "none"; 
    renderRevenueChart(); 
  }
}

async function renderRevenueChart() {
  try {
    const filterType = document.getElementById("filterType").value;
    const monthInput = document.getElementById("monthInput");
    const month = monthInput.value; 

    let query = `?filter=${filterType}`;
    if (filterType === "monthly") {
      if (!month) {
        alert("Please select a valid month.");
        return;
      }
      query += `&month=${month}`;
    }

    const response = await fetch(`/admin/getChartData${query}`);
    const result = await response.json();

    if (result.success) {
      const labels = result.data.map((item) => item.label);
      const chartData = result.data.map((item) => item.totalRevenue);

      console.log("Initializing chart with data:", labels, chartData);

      const ctx = document.getElementById("revenueChart").getContext("2d");


      if (window.revenueChart instanceof Chart) {
        window.revenueChart.destroy();
      }

      window.revenueChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: filterType === "yearly" ? "Monthly Revenue" : "Daily Revenue",
              data: chartData,
              backgroundColor: "#3b82f6",
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => `₹${value.toLocaleString()}`,
              },
            },
          },
        },
      });
    } else {
      console.error("Error fetching revenue data:", result.message);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
toggleMonthInput();
renderRevenueChart();





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

  if (window.location.search) {
    const url = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, url);
  }