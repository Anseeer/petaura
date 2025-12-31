
document.addEventListener("DOMContentLoaded", () => {
  filterSalesReport()
})


document.querySelector(".btn-primary").addEventListener("click", (e) => {
  e.preventDefault();
  console.log("PDF button clicked");
  downloadPDF();
});

document.querySelector(".btn-secondary").addEventListener("click", (e) => {
  e.preventDefault();
  console.log("Excel button clicked");
  downloadExcel();
});
function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const leftMargin = 14;
  const pageHeight = doc.internal.pageSize.height;

  const companyName = "PETAURA";
  const textWidth = doc.getTextWidth(companyName);
  const xPosition = (doc.internal.pageSize.width - textWidth) / 2;
  doc.setFont("helvetica", "bold").setFontSize(14);
  doc.text(companyName, xPosition, 10);

  doc.setFontSize(12).setFont("helvetica", "normal");
  doc.text("Sales Report", leftMargin, 20);

  const tableYStart = 30;
  let tableFinalY;
  doc.autoTable({
    html: "#salesReportTable",
    startY: tableYStart,
    theme: "grid",
    headStyles: { fillColor: [52, 58, 64], textColor: [255, 255, 255] },
    bodyStyles: { halign: "center", valign: "middle" },
    styles: { cellPadding: 5, fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 30 },
      2: { cellWidth: 30 },
      3: { cellWidth: 30 },
      4: { cellWidth: 30 },
      5: { cellWidth: 40 },
    },
    margin: { right: 20 },
    didDrawPage: (data) => {
      tableFinalY = data.cursor.y;
    },
  });

  let totalSales = 0;
  let totalDiscount = 0;
  let totalQuantity = 0;

  const rows = document.querySelectorAll("#salesReportTable tbody tr");
  rows.forEach((row) => {
    const cell = row.querySelectorAll("td");
    const quantity = parseInt(cell[2]?.textContent || 0);
    const discount = parseInt(cell[3]?.textContent || 0);
    const sales = parseInt(cell[4]?.textContent || 0);
    totalQuantity += quantity;
    totalDiscount += discount;
    totalSales += sales;
  });

  const summaryHeight = 25;
  if (tableFinalY + summaryHeight > pageHeight - 20) {
    doc.addPage();
    tableFinalY = 10;
  }

  doc.setFontSize(10);
  doc.text("Summary:", leftMargin, tableFinalY + 10);
  doc.text(`Total Quantity Sold: ${totalQuantity}`, leftMargin, tableFinalY + 15);
  doc.text(`Total Discount: ${totalDiscount}`, leftMargin, tableFinalY + 20);
  doc.text(`Total Sales: ${totalSales}`, leftMargin, tableFinalY + 25);

  const date = new Date();
  const dateString = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  const footerText = `Report Generated on: ${dateString}`;
  const footerY = pageHeight - 10;

  doc.text(footerText, leftMargin, footerY);

  doc.save("Sales_Report.pdf");
}


function downloadExcel() {
  const table = document.getElementById("salesReportTable");
  const workbook = XLSX.utils.table_to_book(table, { sheet: "Sales Report" });

  const worksheet = workbook.Sheets["Sales Report"];
  const range = XLSX.utils.decode_range(worksheet["!ref"]);

  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
      if (worksheet[cellRef]) {
        worksheet[cellRef].s = {
          alignment: { horizontal: "center", vertical: "center" },
          font: { bold: R === 0 }
        };
      }
    }
  }

  XLSX.writeFile(workbook, "Sales_Report.xlsx");
}

async function filterSalesReport() {
  const selectRange = document.getElementById('date').value;
  const filter = document.getElementById('filter').value;
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;

  console.log("Selected Range:", selectRange);
  console.log("Selected Filter:", filter);
  console.log("Start Date:", startDate);
  console.log("End Date:", endDate);

  const dateRangeContainer = document.getElementById('dateRangeContainer');
  validateDates();
  if (selectRange === 'custom') {
    dateRangeContainer.style.display = 'block';
  } else {
    dateRangeContainer.style.display = 'none';
  }
  if (selectRange && filter) {
    try {
      const response = await fetch("/admin/filter-sales", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ selectRange, filter, startDate, endDate })
      });

      if (!response.ok) {
        throw new Error("Failed to fetch sales data");
      }

      const data = await response.json();

      if (data.success && data.order.length > 0) {
        console.log(data.order);
        populateSalesTable(data.order);
      } else {
        const table = document.querySelector('#salesReportTable');

        table.innerHTML = `
          <thead class="thead-dark">
            <tr>
              <th>Product Name</th>
              <th>Product ID</th>
              <th>Quantity</th>
              <th>Total</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colspan="5" class="text-center">No orders found for the selected date range.</td>
            </tr>
          </tbody>
      `;
      }


    } catch (error) {
      console.error("Error fetching sales data:", error);
    }
  }

}

function populateSalesTable(orders) {
  const table = document.querySelector('#salesReportTable');
  if (!table) {
    console.error("Table element not found!");
    return;
  }

  table.innerHTML = `
          <thead class="thead-dark">
            <tr>
              <th>Product Name</th>
              <th>Product ID</th>
              <th>Quantity</th>
              <th>Coupen Discount</th>
              <th>Total</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody></tbody>
      `;

  const tbody = table.querySelector('tbody');

  orders.forEach(order => {
    const row = `
              <tr>
                <td>${order.orderedItems.name}</td>
                <td>${order.orderId}</td>
                <td>${order.orderedItems.quantity}</td>
                <td>${order.orderedItems.discount}</td>
                <td>${order.orderedItems.totalPrice}</td>
                <td>${new Date(order.createdAT).toLocaleString("en-GB")}</td>
              </tr>
          `;
    tbody.innerHTML += row;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("startDate").setAttribute("max", today);
  document.getElementById("endDate").setAttribute("max", today);
});

function validateDates() {
  const startDateInput = document.getElementById("startDate");
  const endDateInput = document.getElementById("endDate");
  const today = new Date().toISOString().split("T")[0];

  if (startDateInput.value > today) {
    Swal.fire({
      icon: "error",
      title: "Invalid Start Date",
      text: "Start Date cannot be in the future.",
    });
    startDateInput.value = "";
    return;
  }

  if (endDateInput.value > today) {
    Swal.fire({
      icon: "error",
      title: "Invalid End Date",
      text: "End Date cannot be in the future.",
    });
    endDateInput.value = "";
    return;
  }

  if (startDateInput.value && endDateInput.value && startDateInput.value > endDateInput.value) {
    Swal.fire({
      icon: "error",
      title: "Invalid Date Range",
      text: "Start Date cannot be after End Date.",
    });
    endDateInput.value = "";
  }
}
