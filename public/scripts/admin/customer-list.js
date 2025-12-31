
function blockCustomer(event, id) {
    event.preventDefault()
    Swal.fire({
        title: "Are you sure?",
        text: "Do you want to block this customer?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, block!",
        cancelButtonText: "No, cancel!",
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/admin/blockCustomer?id=${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.success) {
                        Swal.fire({
                            icon: "success",
                            title: "Customer Blocked!",
                            showCancelButton: false,
                            showConfirmButton: false,
                            timer: 1500,
                        });
                        window.location.reload()
                    } else {
                        Swal.fire({
                            icon: "error",
                            title: "Failed to Block Customer",
                            showCancelButton: false,
                            showConfirmButton: false,
                            timer: 1500,
                        });
                    }
                })
                .catch((error) => {
                    console.error("Error:", error);
                    Swal.fire({
                        icon: "error",
                        title: "An error occurred",
                        text: "Please try again later.",
                        showCancelButton: false,
                        showConfirmButton: true,
                    });
                });
        } else {
            Swal.fire({
                icon: "info",
                title: "Action Cancelled",
                showCancelButton: false,
                showConfirmButton: true,
            });
        }
    });
}

function unblockCustomer(event, id) {
    event.preventDefault()
    Swal.fire({
        title: "Are you sure?",
        text: "Do you want to block this customer?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, block!",
        cancelButtonText: "No, cancel!",
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/admin/unblockCustomer?id=${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.success) {
                        Swal.fire({
                            icon: "success",
                            title: "Customer unBlocked!",
                            showCancelButton: false,
                            showConfirmButton: false,
                            timer: 1500,
                        });
                        window.location.reload()
                    } else {
                        Swal.fire({
                            icon: "error",
                            title: "Failed to unBlock Customer",
                            showCancelButton: false,
                            showConfirmButton: false,
                            timer: 1500,
                        });
                    }
                })
                .catch((error) => {
                    console.error("Error:", error);
                    Swal.fire({
                        icon: "error",
                        title: "An error occurred",
                        text: "Please try again later.",
                        showCancelButton: false,
                        showConfirmButton: true,
                    });
                });
        } else {
            Swal.fire({
                icon: "info",
                title: "Action Cancelled",
                showCancelButton: false,
                showConfirmButton: true,
            });
        }
    });
}

function confirmDeletion(event) {
    event.preventDefault();

    const deleteLink = event.target.closest('a');

    Swal.fire({
        title: 'Are you sure?',
        text: "This will permanently delete the customer!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
        reverseButtons: true,
        background: '#f8f9fa',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        preConfirm: () => {
            window.location.href = deleteLink.href;
        }
    });
}