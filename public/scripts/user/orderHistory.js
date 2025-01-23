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
                    fetchOrder()
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

function fetchOrder(){
    fetch("/user/fetchOrders",{
        method:"GET",
        headers:{
            'Content-Type':'application/json',
        }
    })
    .then((res)=> res.json())
    .then((res)=>{
        if(res.success){
            renderOrders(res.pendingOrder,res.orders,res.currentPage,res.totalPage)
        }else{
            alert("Faild To Fetch ")
        }
    })
    .catch(()=> alert("Error In Fetch "))
}

function renderOrders(pendingOrders, orders, currentPage, totalPage) {
    const contentDiv = document.querySelector('.content');
    let html = '';

    // Pending Orders Section
    if (pendingOrders && pendingOrders.length > 0) {
        html += `
            <div class="p-4 shadow-lg rounded bg-white mb-4">
                <h3 class="mb-4 text-center text-uppercase text-dark">Pending Orders</h3>
                <table class="table table-hover">
                    <thead class="thead-dark">
                        <tr>
                            <th>OrderId</th>
                            <th>Item</th>
                            <th>Date</th>
                            <th>Price</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pendingOrders
                            .map(
                                (pending) => `
                        <tr onclick="location.href='/user/pending-order-details?orderId=${pending._id}'">
                            <td>${pending._id}</td>
                            <td>${pending.orderedItems
                                .map(
                                    (item) =>
                                        `<span>${item.product.name} (x${item.quantity})</span>`
                                )
                                .join(', ')}</td>
                            <td>${new Date(pending.createdAT).toLocaleDateString('en-GB')}</td>
                            <td>₹${Number(pending.finalPrice).toFixed(2)}</td>
                            <td>${pending.status}</td>
                            <td>
                                <button class="btn btn-success btn-sm" onclick="event.stopPropagation(); rePayment(event, '${pending.razorPayOrderId}')">Retry</button>
                            </td>
                        </tr>`
                            )
                            .join('')}
                    </tbody>
                </table>
            </div>`;
    }

    // Order History Section
    html += `
        <div class="container mt-0 py-3 shadow-lg rounded bg-white">
            <h3 class="mb-4 text-center text-uppercase text-dark">Order History</h3>
            ${
                orders && orders.length > 0
                    ? `
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>OrderId</th>
                        <th>Items</th>
                        <th>Date</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
    ${orders
        .map((order) => {
            return `
        <tr onclick="window.location.href='/user/order-details?orderId=${order._id}'">
            <td>${order._id}</td>
            <td>(${order.orderedItems.length})</td> <!-- Display the total length of ordered items -->
            <td>${new Date(order.createdAT).toLocaleDateString('en-GB')}</td>
            <td>₹${Number(order.finalPrice).toFixed(2)}</td>
            <td>${order.status}</td>
            <td>
                ${
                    order.status === 'delivered' &&
                    new Date(order.returnDeadline) > new Date()
                        ? `<span>Return by: ${new Date(order.returnDeadline).toLocaleDateString(
                              'en-GB'
                          )}</span>`
                        : order.status === 'pending'
                        ? `<button class="btn btn-danger btn-sm" onclick="event.stopPropagation(); orderCancel(event, '${order._id}')">Cancel</button>`
                        : ''
                }
            </td>
        </tr>`;
        })
        .join('')}
</tbody>

            </table>
            `
                    : `
            <div class="no-orders text-center">
                <h3>Your order history is empty!</h3>
                <p>It seems like you haven’t placed any orders yet.</p>
                <a href="/user/" class="btn btn-primary">Start Shopping</a>
            </div>
            `
            }
        </div>
    `;

    // Pagination Section
    html += `
        <div class="pagination mt-4">
            ${
                currentPage > 1
                    ? `<a href="/user/orderHistory?page=${currentPage - 1}" class="btn">Previous</a>`
                    : `<a class="btn disabled">Previous</a>`
            }
            ${Array.from({ length: totalPage }, (_, i) => i + 1)
                .map(
                    (page) => `
                <a href="/user/orderHistory?page=${page}" class="btn ${
                        currentPage === page ? 'btn-secondary' : ''
                    }">${page}</a>
            `
                )
                .join('')}
            ${
                currentPage < totalPage
                    ? `<a href="/user/orderHistory?page=${currentPage + 1}" class="btn">Next</a>`
                    : `<a class="btn disabled">Next</a>`
            }
        </div>
    `;

    // Update the content of the page
    contentDiv.innerHTML = html;
}
