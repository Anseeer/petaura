  let selectedAddressId = null;
  let selectedPaymentMethod = null;
  let appliedDiscount = 0;

  function toggleAddressDropdown() {
    const dropdown = document.getElementById('addressDropdown');
    dropdown.classList.toggle('d-none');
  }

  function selectAddress(address, id) {
    const selectedAddressContainer = document.getElementById('addressText');
    const editIcon = document.getElementById('editAddressIcon');

    selectedAddressContainer.innerHTML = `<strong>Selected Address:</strong><p>${address}</p>`;
    selectedAddressId = id;

    // Update the edit icon link with the address ID
    const editLink = document.querySelector('#selectedAddress a');
    editLink.href = `/user/edit-addressInCheckout?id=${id}`;

    // Show edit icon after selection
    editIcon.classList.remove('d-none');

    // Hide dropdown after selection
    const dropdown = document.getElementById('addressDropdown');
    dropdown.classList.add('d-none');

    checkSelections();
  }

  function selectPaymentMethod(method) {
    const paymentContainer = document.getElementById('selectedPaymentMethod');
    paymentContainer.innerHTML = `<strong>Selected Payment Method:</strong><p>${method}</p>`;
    selectedPaymentMethod = method;

    checkSelections();
  }

  function checkSelections() {
  const placeOrderButton = document.getElementById("placeOrderButton");

  if (selectedAddressId && selectedPaymentMethod) {
    placeOrderButton.disabled = false; // Enable the button
  } else {
    placeOrderButton.disabled = true; // Keep it disabled
  }
}


  function toggleCouponDropdown() {
    const couponDropdown = document.getElementById('couponDropdown');
    couponDropdown.classList.toggle('d-none');
  }


  document.getElementById("placeOrderButton").addEventListener("click", function () {
    let delivery ;
    const discount= document.getElementById("coupenDiscount").innerHTML.slice(1);
    if('<%= cart.totalPrice %>' < 500 ){
       delivery= document.getElementById("deliveryFee").innerHTML.slice(1);
    }
    fetch("/user/place-order", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: '<%= user %>',
        addressId: selectedAddressId,
        paymentMethod: selectedPaymentMethod,
        subTotal:'<%= cart.totalPrice %>',
        discount:discount,
        deliveryFee:delivery||0,
        orderItem: '<%-JSON.stringify(cart.items) %>',
        totalPrice: document.getElementById('orderTotal').textContent.replace('₹', ''),
        discountApplied: appliedDiscount
      })
    })
      .then((response) => response.json())
      .then((response) => {
        console.log("respponse:",response)
        if (response.success) {
          if (selectedPaymentMethod == "Razorpay" && response.razorPayOrderId) {
    // Initialize Razorpay for online payment
    const rzp = new Razorpay({
        key: response.razorpayKey, // Replace with your Razorpay test key
        amount: response.finalPrice * 100, // Convert to paise
        currency: 'INR',
        name:"PETAURA",
        description:"ALL PET SUPPLIES",
        order_id: response.razorPayOrderId,
        handler: async (razorpayResponse) => {
            // Ensure required fields are present
            if (!razorpayResponse.razorpay_payment_id || !razorpayResponse.razorpay_order_id) {
                console.error("Incomplete Razorpay response:", razorpayResponse);
                rzp.close();
                return;
            }

            try {
                // Verify payment with the backend
              const verifyResponse = await fetch(`/user/verifyOnline-payment/${response.orderId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                    razorpay_order_id: razorpayResponse.razorpay_order_id,
                    razorpay_signature: razorpayResponse.razorpay_signature,
                }),
            });

                console.log("verificaionRES:",verifyResponse);

                const verificationResult = await verifyResponse.json();
                if (verificationResult.success) {
                    Swal.fire({
                        icon: "success",
                        title: "Order placed successfully",
                        text: response.message,
                        timer: 1500,
                        showConfirmButton: false,
                    })
                    window.location.href = `/user/orderPlaced`;
                } else {
                    console.error("Payment verification failed:", verificationResult);
                    rzp.close();
                }
            } catch (error) {
                console.error("Error during payment verification:", error);
                rzp.close();
            }
        },
        modal: {
            ondismiss: () => {
                console.log("Payment modal dismissed by user");
            },
        },
    });

    // Handle payment failure
    rzp.on('payment.failed', (error) => {
        console.error("Payment failed:", error);
        rzp.close();
        // Redirect user as needed
        Swal.fire({
                        icon: "error",
                        title: "Order Payment Faild",
                        timer: 1500,
                        showConfirmButton: false,
                    })
                    window.location.href = `/user/orderHistory`; 
    });

    // Open Razorpay modal
    rzp.open();
}else{
            Swal.fire({
            icon: "success",
            title: "Order placed Sucess ",
            text: response.message,
            timer: 1500,
            showConfirmButton: false,
            showCancelButton: false
          })
          window.location.href = `/user/orderPlaced`;
          }
        } else {
          Swal.fire({
            icon: "error",
            title: "Order placed failed",
            text: response.message,
            timer: 1500,
            showConfirmButton: false,
            showCancelButton: false
          });
        }
      })
      .catch((err) => alert("Error placing order.",err));
  });

  function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    Swal.fire({
      icon: 'success',
      title: 'Copied!',
      text: 'Coupon code copied to clipboard.',
      showCancelButton:false,
      showConfirmButton:false,
      timer:1500
    });
  }).catch(() => {
    Swal.fire({
      icon: 'error',
      title: 'Failed!',
      text: 'Failed to copy coupon code.',
      showCancelButton:false,
      showConfirmButton:false,
      timer:1500
    });
  });
}


function applyCoupon(event) {
  const applyCoupen = document.getElementById("applyCoupen");

      event.preventDefault(); 

      const inputCode = document.getElementById("couponCode").value;
      const totalAmount = document.getElementById("orderTotal").innerHTML.slice(1);

      console.log("inputCode:", inputCode, "totalAmount:", totalAmount);

      fetch("/user/apply-coupen",{
        method:"POST",
        headers:{
          'Content-Type':'application/json'
        },
        body:JSON.stringify({inputCode,totalAmount})
      })
      .then((res)=> res.json())
      .then((res)=>{
        if(res.success){
          Swal.fire({
            icon:"success",
            title:"Applyed",
            text:res.message,
            timer:1500,
            showCancelButton:false,
            showConfirmButton:false,
          }).then(()=>{
            // const subtotal = "<%= cart.totalPrice %>";
            const total = totalAmount - res.discountValue;
            document.getElementById('orderTotal').innerHTML = `₹${total.toFixed(2)}`;
            document.getElementById('coupenDiscount').innerHTML = `₹${res.discountValue}`;
          })
          applyCoupen.disabled = true; // Disables the button

        }else{
          Swal.fire({
            icon:"error",
            title:"Faild To Apply",
            text:res.message,
            timer:1500,
            showCancelButton:false,
            showConfirmButton:false,
          })
        }
      })
      .catch(()=>{
        Swal.fire({
            icon:"error",
            title:"Error",
            text:message,
            timer:1500,
            showCancelButton:false,
            showConfirmButton:false,
          })
      })
    }
