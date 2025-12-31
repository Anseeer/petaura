
function getInvoice(e, orderId) {
    e.preventDefault();
    console.log("ID:", orderId);

    fetch(`/getInvoice/${orderId}`, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json'
        },
    })
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'invoice.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
        })
        .catch(err => console.error('Error fetching PDF:', err));

}


function SingleorderCancel(event, itemId, orderId) {
    event.preventDefault();

    Swal.fire({
        icon: "warning",
        title: "Are you sure?",
        text: "You want to cancel this order?",
        showCancelButton: true,
        confirmButtonText: "Yes, cancel it",
        cancelButtonText: "No",
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            fetch("/single-order-cancel", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId, orderId })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire({
                            icon: "success",
                            title: "Order Canceled Successfully",
                            text: data.message,
                            timer: 1500,
                            showConfirmButton: false
                        });
                        location.reload();
                    } else {
                        throw new Error(data.message || "Something went wrong. Please try again.");
                    }
                })
                .catch(error => {
                    Swal.fire({
                        icon: "error",
                        title: "Order Cancellation Failed",
                        text: error.message,
                        timer: 1500,
                        showConfirmButton: false
                    });
                });
        }
    }).catch(error => {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Something went wrong. Please try again!",
            timer: 1500,
            showConfirmButton: false
        });
    });
}


function returnOrderRequest(event, itemId, orderId) {
    event.preventDefault();

    Swal.fire({
        icon: "warning",
        title: "Are you sure?",
        text: "You want to request a return for this order?",
        showCancelButton: true,
        confirmButtonText: "Yes, return it",
        cancelButtonText: "No",
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Reason for Return',
                input: 'text',
                inputLabel: 'Please enter the reason for the return',
                inputPlaceholder: 'Enter reason here...',
                showCancelButton: true,
                confirmButtonText: 'Submit',
                preConfirm: (reason) => {
                    return fetch("/order-return-request", {
                        method: "POST",
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ itemId, orderId, reason })
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (!data.success) {
                                throw new Error(data.message || "Something went wrong. Please try again.");
                            }
                            Swal.fire({
                                icon: "success",
                                title: "Return request sent",
                                text: data.message,
                                timer: 1500,
                                showConfirmButton: false
                            });
                            location.reload();
                        })
                        .catch(error => {
                            Swal.fire({
                                icon: "error",
                                title: "Order return failed",
                                text: error.message,
                                timer: 1500,
                                showConfirmButton: false
                            });
                        });
                }
            });
        }
    }).catch(error => {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Something went wrong. Please try again!",
            timer: 1500,
            showConfirmButton: false,
        });
    });
}