
function blockCustomer(event,id){
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
            // If confirmed, proceed with the fetch request
            fetch(`/admin/blockCustomer?id=${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            })
                .then((res) => res.json()) // Ensure response is converted to JSON
                .then((data) => {
                    if (data.success) {
                        Swal.fire({
                            icon: "success",
                            title: "Customer Blocked!",
                            showCancelButton: false,
                            showConfirmButton: false,
                            timer: 1500, // Auto close after 1.5 seconds
                        });
                        window.location.reload()
                    } else {
                        Swal.fire({
                            icon: "error",
                            title: "Failed to Block Customer",
                            showCancelButton: false,
                            showConfirmButton: false,
                            timer: 1500, // Auto close after 1.5 seconds
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
            // If canceled, display an optional message
            Swal.fire({
                icon: "info",
                title: "Action Cancelled",
                showCancelButton: false,
                showConfirmButton: true,
            });
        }
    });
}

function unblockCustomer(event,id){
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
            // If confirmed, proceed with the fetch request
            fetch(`/admin/unblockCustomer?id=${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            })
                .then((res) => res.json()) // Ensure response is converted to JSON
                .then((data) => {
                    if (data.success) {
                        Swal.fire({
                            icon: "success",
                            title: "Customer unBlocked!",
                            showCancelButton: false,
                            showConfirmButton: false,
                            timer: 1500, // Auto close after 1.5 seconds
                        });
                        window.location.reload()
                    } else {
                        Swal.fire({
                            icon: "error",
                            title: "Failed to unBlock Customer",
                            showCancelButton: false,
                            showConfirmButton: false,
                            timer: 1500, // Auto close after 1.5 seconds
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
            // If canceled, display an optional message
            Swal.fire({
                icon: "info",
                title: "Action Cancelled",
                showCancelButton: false,
                showConfirmButton: true,
            });
        }
    });
}

    // Colorful and custom confirmation alert
    function confirmDeletion(event) {
        event.preventDefault(); // Prevents the default link action (so we can show the alert)
        
        const deleteLink = event.target.closest('a'); // Find the link that triggered the event

        Swal.fire({
            title: 'Are you sure?',
            text: "This will permanently delete the customer!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!',
            reverseButtons: true,
            background: '#f8f9fa',  // Light background
            confirmButtonColor: '#d33', // Red color for confirmation button
            cancelButtonColor: '#3085d6', // Blue color for cancel button
            preConfirm: () => {
                // If confirmed, follow the link to delete the customer
                window.location.href = deleteLink.href;
            }
        });
    }