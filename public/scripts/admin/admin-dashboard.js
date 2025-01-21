 // Assuming you've already calculated total revenue (5% of totalPrice)

 // Bar Chart for Revenue Data (Only 1 Bar)
 const revenueData = {
     labels: ["Total Revenue"], // Label for the single bar
     datasets: [{
         label: 'Revenue ',
         data: [totalRevenue], // Pass the total revenue as a single data point
         backgroundColor: 'grey', // Customize the bar color
         borderColor: 'black', // Border color for the bar
         borderWidth: 1, // Border width for the bar
         barThickness: 38, // Border width for the bar
     }]
 };
 
 // Create the chart with a single bar for total revenue
 const ctx = document.getElementById('revenueBarChart').getContext('2d');
 new Chart(ctx, {
     type: 'bar',
     data: revenueData,
     options: {
         responsive: true,
         plugins: {
             legend: {
                 display: true,
                 position: 'top', // Position of the legend
             }
         },
         scales: {
             x: {
                 title: {
                     display: true,
                     text: 'Revenue' // Title for the X-axis
                 }
             },
             y: {
                 beginAtZero: true, // Start the Y-axis at 0
                 title: {
                     display: true,
                     text: 'Amount ($)' // Title for the Y-axis
                 }
             }
         }
     }
 });
 
    
     function filterRevenue(event,filter){
         event.preventDefault();
         filter = filter ? filter : "year";
         fetch(`/admin/fetchDashboard?filter=${filter}`, {
         method: "GET",
         headers: {
             "Content-Type": "application/json",
         },
     })
     .then((res) => {
         if (!res.ok) {
             throw new Error("Failed to fetch data from the server");
         }
         return res.json(); // Parse the response as JSON
     })
     .then((data) => {
         updateDashboard(data); // Call your update function with the received data
     })
     .catch((err) => {
     });
 }
 
     function updateDashboard(data) {
     // Update Total Revenue
     const revenueElement = document.querySelector('.summary-cards .summary-card:nth-child(2) p');
     revenueElement.textContent = `₹${data.revenue.toFixed(2)}`;
 
     // Update Total Sales
     const totalSalesElement = document.querySelector('.summary-cards .summary-card:nth-child(1) p');
     totalSalesElement.textContent = data.totalSales;
 
     // Update Revenue Chart
     updateRevenueChart(data.revenue); // Call the function to update the chart
 }
 
 // Function to update the chart
 function updateRevenueChart(newRevenue) {
     const chart = Chart.getChart("revenueBarChart"); // Get existing chart instance
     if (chart) {
         chart.data.datasets[0].data = [newRevenue]; // Update the data
         chart.update(); // Re-render the chart
     }
 }
 
 
function isCustom(e,filter){
    e.preventDefault();
    const CustomFilterContainer = document.getElementById("customFilter")
    if(filter == 'custom'){
        CustomFilterContainer.style.display = "block";
    }else{
        CustomFilterContainer.style.display = "none";
    }
 }
 
 function CustomFilter() {
    const startDateInput = document.getElementById("startDate");
    const endDateInput = document.getElementById("endDate");
    const errorDiv = document.getElementById("errorMessage"); // Error message container
    const start = startDateInput.value;
    const end = endDateInput.value;
    const today = new Date().toISOString().split("T")[0]; // Today's date in YYYY-MM-DD format

    // Clear previous error messages
    if (errorDiv) errorDiv.textContent = "";

    // Validation: Ensure dates are not in the future
    if (start > today) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Start Date',
            text: 'Start Date cannot be in the future.',
        });
        startDateInput.value = ""; // Clear the invalid value
        return;
    }

    if (end > today) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid End Date',
            text: 'End Date cannot be in the future.',
        });
        endDateInput.value = ""; // Clear the invalid value
        return;
    }

    // Validation: Ensure start date is not greater than end date
    if (start && end && start > end) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Date Range',
            text: 'Start Date cannot be greater than End Date.',
        });
        endDateInput.value = ""; // Clear the end date to prevent invalid range
        return;
    }

    console.log("Validated Dates - Start:", start, "End:", end);

    // Proceed with fetching data
    fetch(`/admin/fetchDashboard?start=${start}&end=${end}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((res) => {
            if (!res.ok) {
                throw new Error("Failed to fetch data from the server");
            }
            return res.json(); // Parse the response as JSON
        })
        .then((data) => {
            updateDashboard(data); // Call your update function with the received data
        })
        .catch((err) => {
            console.error("Error fetching dashboard data:", err);

            // Optional: Display error message in the UI
            if (errorDiv) {
                errorDiv.textContent = "An error occurred while fetching the dashboard data. Please try again.";
            }

            // Optional: Show a SweetAlert error popup
            Swal.fire({
                icon: 'error',
                title: 'Fetch Error',
                text: 'An error occurred while fetching the data. Please try again later.',
            });
        });
}

