function orderCancel(event, orderId) {
    event.preventDefault(); 

    console.log(orderId); 

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
            fetch("/user/order-cancel", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId})
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


// function returnOrderRequest(event, orderId) {
//     event.preventDefault(); // Prevent default form behavior
//     Swal.fire({
//         icon: "warning",
//         title: "Are you sure?",
//         text: "You want to request a return for this order?",
//         showCancelButton: true,
//         confirmButtonText: "Yes, return it",
//         cancelButtonText: "No",
//         reverseButtons: true
//     }).then((result) => {
//         if (result.isConfirmed) {

//             Swal.fire({
//                 title: 'Reason for Return',
//                 input: 'text',
//                 inputLabel: 'Please enter the reason for the return',
//                 inputPlaceholder: 'Enter reason here...',
//                 showCancelButton: true,
//                 confirmButtonText: 'Submit',
//                 preConfirm: (reason) => {
//                     return fetch("/user/order-return-request", {
//                         method: "POST",
//                         headers: { 'Content-Type': 'application/json' },
//                         body: JSON.stringify({ orderId, userId, productId, orderedItemId,productQty , productPrice, reason })
//                     })
//                     .then(response => response.json())
//                     .then(data => {
//                         if (!data.success) {
//                             throw new Error(data.message || "Something went wrong. Please try again.");
//                         }
//                         Swal.fire({
//                             icon: "success",
//                             title: "Return request sent",
//                             text: data.message,
//                             timer: 1500,
//                             showConfirmButton: false
//                         });
//                         location.reload(); // Reload page to refresh the order list
//                     })
//                     .catch(error => {
//                         Swal.fire({
//                             icon: "error",
//                             title: "Order return failed",
//                             text: error.message,
//                             timer: 1500,
//                             showConfirmButton: false
//                         });
//                     });
//                 }
//             });
//         }
//     }).catch(error => {
//         Swal.fire({
//             icon: "error",
//             title: "Error",
//             text: "Something went wrong. Please try again!",
//             timer: 1500,
//             showConfirmButton: false,
//         });
//     });
// }


function rePayment(event, razorPayOrderId) {
    event.preventDefault();
    console.log("orderId:", razorPayOrderId);
    console.log("1");

    // Send a request to update the pending order
    fetch("/user/updatePendingOrder", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ razorPayOrderId }),
    })
    .then((response) => {
        console.log("2");
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        return response.json(); // Return parsed JSON
    })
    .then((response) => {
        console.log("response:", response);
        console.log("3");

        if (response.success) {
            console.log("4");
            try {
                // Initialize Razorpay for the online payment
                const rzp = new Razorpay({
                    key: response.razorpayKey, // Your Razorpay key
                    amount: response.pendingOrder[0].finalPrice, // Amount to be paid in paise (1 INR = 100 paise)
                    currency: "INR", // Currency used for payment
                    order_id: response.pendingOrder[0].razorPayOrderId, // Razorpay order ID

                    // Handle payment success
                    handler: async (razorpayResponse) => {
                        try {
                            console.log("orderId",response.pendingOrder[0].orderId)
                            // Send the Razorpay payment response to your server for verification
                            const result = await fetch(`/user/verifyOnline-payment/${response.pendingOrder[0].orderId}`, {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify(razorpayResponse),
                            })
                            .catch(err => {
                                // Handle network errors during the fetch request
                                console.error("Network Error:", err);
                                throw err;
                            });

                            // Parse the JSON response from the server
                            const verificationResult = await result.json();

                            // Check if payment verification was successful
                            if (verificationResult.success) {
                                // Redirect to order confirmation page
                                window.location.href = `/user/orderPlaced`;
                            } else {
                                // Show error message if payment verification fails
                            }
                        } catch (err) {
                            // Handle errors that occur during payment verification
                            console.error("Verification Error:", err);
                        }
                    },

                    theme: {
                        color: "#3399cc", // Customize the color of the Razorpay modal
                    }
                });

                // Handle payment failure
                rzp.on("payment.failed", (response) => {
                    console.error("Payment Failed Response:", response);
                });

                // Open the Razorpay payment modal
                rzp.open();
            } catch (error) {
                console.error("Error during payment verification:", error);
                rzp.close();
            }
        } else {
            console.error("Failed to retrieve order details:", response.message);
        }
    })
    .catch((error) => {
        console.error("Error occurred:", error);
        Swal.fire({
            icon: "error",
            title: "Payment failed",
            text: "There was an issue with the payment process.",
            timer: 1500,
            showConfirmButton: false,
        });
    });
}

