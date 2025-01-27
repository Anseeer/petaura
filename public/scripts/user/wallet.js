 // Add click event listener to the Add Money button
 document.querySelector('.add-money').addEventListener('click', function () {
    // Show the modal
    const addMoneyModal = new bootstrap.Modal(document.getElementById('addMoneyModal'));
    addMoneyModal.show();
});

function addMoneyToWallet(e) {
e.preventDefault();
const addMoneyModal = bootstrap.Modal.getInstance(document.getElementById('addMoneyModal'));
addMoneyModal.hide();
const amount = document.getElementById("amount").value;
console.log(`amount: ${amount}`);

fetch("/addToWallet", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount })
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        // Use data from backend
        const razorPayOrderId = data.razorPayOrderId;
        const amount = data.amount; // Correct way to access amount

        const options = {
            key: data.razorpayKey, // Razorpay key from backend
            amount: amount, // Amount in paise
            currency: "INR",
            order_id: razorPayOrderId, // Order ID from backend
            handler: function (response) {
                fetch('/Wallet-verify-payment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature,
                    })
                })
                .then(res => res.json())
                .then(paymentResponse => {
                    if (paymentResponse.success) {
                        Swal.fire({
                            icon:"success",
                            title:"ADDED",
                            timer:1200,
                            showConfirmButton:false,
                            showCancelButton:false,
                        })
                        window.location.href="/wallet";
                    } else {
                        Swal.fire({
                            icon:"error",
                            title:"Faild To Add",
                            timer:1200,
                            showConfirmButton:false,
                            showCancelButton:false,
                        })
                    }
                });
            },
           
            theme: {
                color: '#F37254',
            }
        };

        // Open Razorpay modal
        const rzp = new Razorpay(options);
        rzp.open();
    } else {
        alert('Failed to create Razorpay order.');
    }
})
.catch(error => console.log('Error:', error));
}
