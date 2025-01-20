function updateStatus(orderId, status) {
    console.log(orderId, status);
    fetch("/admin/edit-order-status", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, status })
    })
        .then((response) => response.json())
        .then((response) => {
            if (response.success) {
                Swal.fire({
                    icon: "success",
                    title: "Update Status Successfully",
                    text: response.message,
                    timer: 1500,
                    showCancelButton: false,
                    showConfirmButton: false
                }).then(() => {
                    // If `select` is required, ensure it's defined
                    const select = document.querySelector(`[data-order-id="${orderId}"]`); // Example: Get select element dynamically
                    if (select) {
                        select.disabled = true; // Disable the dropdown
                    }
                    window.location.reload(); // Reload the page
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Update Status Failed",
                    text: response.message,
                    timer: 1500,
                    showCancelButton: false,
                    showConfirmButton: false
                });
            }
        })
        .catch(() => {
            Swal.fire({
                icon: "error",
                title: "Error In Update Status",
                timer: 1500,
                showCancelButton: false,
                showConfirmButton: false
            });
        });
}

function orderCancel(ordersId,itemsId) {
    Swal.fire({
        icon: "warning",
        title: "Are you sure?",
        text: "Do you want to cancel this order?",
        showCancelButton: true,
        showConfirmButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No"
    })
    .then((result) => {
        if (result.isConfirmed) {
            fetch("/admin/order-cancel", {
                method: "POST",
                headers: {
                    'Content-Type': "application/json"
                },
                body: JSON.stringify({ ordersId,itemsId })
            })
            .then((response) => response.json())
            .then((response) => {
                if (response.success) {
                    Swal.fire({
                        icon: "success",
                        title: "Order Cancelled",
                        timer: 1500,
                        showCancelButton: false,
                        showConfirmButton: false
                    }).then(() => {
                        location.reload();
                    });
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Order Cancellation Failed",
                        timer: 1500,
                        showCancelButton: false,
                        showConfirmButton: false
                    });
                }
            });
        }
    })
    .catch(() => {
        Swal.fire({
            icon: "error",
            title: "Error in cancelOrder",
            timer: 1500,
            showCancelButton: false,
            showConfirmButton: false
        });
    });
}