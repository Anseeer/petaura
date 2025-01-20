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
 