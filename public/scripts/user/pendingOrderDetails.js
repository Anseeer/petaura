

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
                                window.location.href = `/user/orderHistory`;
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

