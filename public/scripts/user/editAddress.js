  
      function editAddress(event) {
        event.preventDefault();
    
        // Collect form values
        const typeOfAddress = document.getElementById("typeOfAddress").value;
        const name = document.getElementById("name").value.trim();
        const country = document.getElementById("country").value.trim();
        const state = document.getElementById("state").value.trim();
        const pincode = document.getElementById("pincode").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const addressId = document.getElementById("id").value;
    
        // Error message elements
        const err1 = document.getElementById("err1");
        const err2 = document.getElementById("err2");
        const err3 = document.getElementById("err3");
        const err4 = document.getElementById("err4");
        const err5 = document.getElementById("err5");
        const err6 = document.getElementById("err6");
    
        // Validation patterns
        const textPattern = /^[A-Za-z\s]+$/;
        const pincodePattern = /^\d{6}$/;
        const phonePattern = /^\d{10}$/;
    
        // Clear previous errors
        [err1, err2, err3, err4, err5, err6].forEach(err => err.style.display = "none");
    
        // Validation checks
        let isValid = true;
    
        if (!typeOfAddress || !textPattern.test(typeOfAddress)) {
            err1.style.display = "block";
            err1.innerText = "Please enter a valid type of address (alphabets only).";
            isValid = false;
        }
    
        if (!name || !textPattern.test(name)) {
            err2.style.display = "block";
            err2.innerText = "Please enter a valid name (alphabets only).";
            isValid = false;
        }
    
        if (!country || !textPattern.test(country)) {
            err3.style.display = "block";
            err3.innerText = "Please enter a valid country (alphabets only).";
            isValid = false;
        }
    
        if (!state || !textPattern.test(state)) {
            err4.style.display = "block";
            err4.innerText = "Please enter a valid state (alphabets only).";
            isValid = false;
        }
    
        if (!pincode || !pincodePattern.test(pincode)) {
            err5.style.display = "block";
            err5.innerText = "Please enter a valid 6-digit pincode.";
            isValid = false;
        }
    
        if (!phone || !phonePattern.test(phone)) {
            err6.style.display = "block";
            err6.innerText = "Please enter a valid 10-digit phone number.";
            isValid = false;
        }
    
        // Stop if any validation failed
        if (!isValid) return false;
    
        // Send data via fetch API
        fetch("/editAddress", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ addressId, typeOfAddress, name, country, state, pincode, phone })
        })
        .then(response => response.json())
        .then(response => {
            if (response.success) {
                Swal.fire({
                    icon: "success",
                    title: "Edit Address Successful",
                    text: response.message,
                    timer: 1500,
                    showConfirmButton: false,
                }).then(() => {
                    window.location.href = "/address";
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Edit Address Failed",
                    text: response.message,
                    timer: 1500,
                    showConfirmButton: false,
                });
            }
        })
        .catch(err => {
            Swal.fire({
                icon: "error",
                title: "Error Editing Address",
                text: err.message,
                timer: 1500,
                showConfirmButton: false,
            });
        });
    }
    
    