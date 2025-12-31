

function rePayment(event, razorPayOrderId) {
    event.preventDefault();
    console.log("orderId:", razorPayOrderId);
    console.log("1");

    fetch("/updatePendingOrder", {
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
            return response.json();
        })
        .then((response) => {
            console.log("response:", response);
            console.log("3");

            if (response.success) {
                console.log("4");
                try {
                    const rzp = new Razorpay({
                        key: response.razorpayKey,
                        amount: response.pendingOrder[0].finalPrice,
                        currency: "INR",
                        order_id: response.pendingOrder[0].razorPayOrderId,

                        handler: async (razorpayResponse) => {
                            try {
                                console.log("orderId", response.pendingOrder[0].orderId)
                                const result = await fetch(`/verifyOnline-payment/${response.pendingOrder[0].orderId}`, {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify(razorpayResponse),
                                })
                                    .catch(err => {
                                        console.error("Network Error:", err);
                                        throw err;
                                    });

                                const verificationResult = await result.json();

                                if (verificationResult.success) {
                                    window.location.href = `/orderHistory`;
                                }
                            } catch (err) {
                                console.error("Verification Error:", err);
                            }
                        },

                        theme: {
                            color: "#3399cc",
                        }
                    });

                    rzp.on("payment.failed", (response) => {
                        console.error("Payment Failed Response:", response);
                    });

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

