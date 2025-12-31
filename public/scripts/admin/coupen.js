
function search(e) {
  e.preventDefault();
  const searchTerm = document.getElementById("couponSearch").value;
  fetch(`/admin/coupen?searchTerm=${searchTerm}`, {
    method: "GET",
    headers: {
      'Content-Type': 'application/json'
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error;
      } else {
        res.json()
      }
    })
    .then(() => console.log("SEARCH ITEM"))
    .catch((res) => {
      console.log("ERROR");
    })
}

function deleteCoupen(id) {
  Swal.fire({
    icon: "warning",
    title: "Are You Sure?",
    showConfirmButton: true,
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "No",
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`/admin/delete-coupen?id=${id}`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            Swal.fire({
              icon: "success",
              title: "Successfully Deleted",
              text: data.message,
              timer: 1200,
              showCancelButton: false,
              showConfirmButton: false
            }).then(() => {
              location.reload();
            });
          } else {
            Swal.fire({
              icon: "error",
              title: "Failed to Delete",
              text: data.message,
              timer: 1200,
              showCancelButton: false,
              showConfirmButton: false
            });
          }
        })
        .catch((err) => {
          Swal.fire({
            icon: "error",
            title: "Error in Deleting Coupon",
            text: err.message,
            timer: 2000,
            showCancelButton: false,
            showConfirmButton: false
          });
        });
    } else if (result.isDismissed) {
      Swal.fire({
        icon: "info",
        title: "Cancelled",
        text: "Your item is safe.",
      });
    }
  });
}
function inActive(event, code) {
  event.preventDefault();

  fetch(`/admin/inActive?code=${encodeURIComponent(code)}`, {
    method: "GET",
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(res => res.json())
    .then(res => {
      if (res.success) {
        updateCouponTable(res.data);
      }
    })
    .catch(error => console.error("Error:", error));
}

function Active(event, code) {
  event.preventDefault();

  fetch(`/admin/Active?code=${encodeURIComponent(code)}`, {
    method: "GET",
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(res => res.json())
    .then(res => {
      if (res.success) {
        updateCouponTable(res.data);
      }
    })
    .catch(error => console.error("Error:", error));
}

function updateCouponTable(coupenList) {
  let tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = "";

  coupenList.forEach(coupen => {
    let tableData = `
        <tr>
          <td>${coupen.code}</td>
          <td>${coupen.discountPercentage}</td>
          <td>${coupen.minOrderValue}</td>
          <td>${new Date(coupen.createdAt).toLocaleDateString("en-GB")}</td>
          <td>${new Date(coupen.expiredAt).toLocaleDateString("en-GB")}</td>
          <td>${coupen.usageLimit}</td>
          <td>
            ${coupen.isActive
        ? `<button class="btn btn-success btn-sm" onclick="inActive(event, '${coupen.code}')">Active</button>`
        : `<button class="btn btn-danger btn-sm" onclick="Active(event, '${coupen.code}')">InActive</button>`}
          </td>
          <td class="table-action-icons">
            <a href="/admin/edit-coupon?id=${coupen._id}" class="btn btn-sm btn-warning">Edit</a>
            <a onclick="return deleteCoupen('${coupen._id}')" class="btn btn-sm btn-danger">Delete</a>
          </td>
        </tr>
      `;

    tableBody.insertAdjacentHTML('beforeend', tableData);
  });
}


