const revenueData = {
    labels: ["Total Revenue"],
    datasets: [{
        label: 'Revenue ',
        data: [totalRevenue],
        backgroundColor: 'grey',
        borderColor: 'black',
        borderWidth: 1,
        barThickness: 38,
    }]
};

const ctx = document.getElementById('revenueBarChart').getContext('2d');
new Chart(ctx, {
    type: 'bar',
    data: revenueData,
    options: {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                position: 'top',
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Revenue'
                }
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Amount ($)'
                }
            }
        }
    }
});


function filterRevenue(event, filter) {
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
            return res.json();
        })
        .then((data) => {
            updateDashboard(data);
        })
        .catch((err) => {
        });
}

function updateDashboard(data) {
    const revenueElement = document.querySelector('.summary-cards .summary-card:nth-child(2) p');
    revenueElement.textContent = `₹${data.revenue.toFixed(2)}`;

    const totalSalesElement = document.querySelector('.summary-cards .summary-card:nth-child(1) p');
    totalSalesElement.textContent = data.totalSales;

    updateRevenueChart(data.revenue);
}

function updateRevenueChart(newRevenue) {
    const chart = Chart.getChart("revenueBarChart");
    if (chart) {
        chart.data.datasets[0].data = [newRevenue];
        chart.update();
    }
}


function isCustom(e, filter) {
    e.preventDefault();
    const CustomFilterContainer = document.getElementById("customFilter")
    if (filter == 'custom') {
        CustomFilterContainer.style.display = "block";
    } else {
        CustomFilterContainer.style.display = "none";
    }
}

function CustomFilter() {
    const startDateInput = document.getElementById("startDate");
    const endDateInput = document.getElementById("endDate");
    const errorDiv = document.getElementById("errorMessage");
    const start = startDateInput.value;
    const end = endDateInput.value;
    const today = new Date().toISOString().split("T")[0];

    if (errorDiv) errorDiv.textContent = "";

    if (start > today) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Start Date',
            text: 'Start Date cannot be in the future.',
        });
        startDateInput.value = "";
        return;
    }

    if (end > today) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid End Date',
            text: 'End Date cannot be in the future.',
        });
        endDateInput.value = "";
        return;
    }

    if (start && end && start > end) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Date Range',
            text: 'Start Date cannot be greater than End Date.',
        });
        endDateInput.value = "";
        return;
    }

    console.log("Validated Dates - Start:", start, "End:", end);

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
            return res.json();
        })
        .then((data) => {
            updateDashboard(data);
        })
        .catch((err) => {
            console.error("Error fetching dashboard data:", err);

            if (errorDiv) {
                errorDiv.textContent = "An error occurred while fetching the dashboard data. Please try again.";
            }

            Swal.fire({
                icon: 'error',
                title: 'Fetch Error',
                text: 'An error occurred while fetching the data. Please try again later.',
            });
        });
}

