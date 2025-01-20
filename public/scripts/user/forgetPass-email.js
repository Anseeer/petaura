function forgetPass(e) {
    e.preventDefault(); // Prevent form submission

    // Email Validation
    const emailInput = document.getElementById("email");
    const emailError = document.getElementById("emailError");
    const email = emailInput.value.trim();
    const emailPattern = /^[a-z0-9._%+-]+@gmail\.com$/;

    if (!emailPattern.test(email)) {
        // Show error message if email is invalid
        emailError.style.display = 'block';
        return; // Stop execution if validation fails
    } else {
        // Hide error message if email is valid
        emailError.style.display = 'none';
    }

    // Proceed with fetch if email is valid
    console.log("Email:", email);
    fetch("/user/forget-pass", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
    })
       .then((res)=> res.json())
        .then((res) => {
            if(res.success){
                Swal.fire({
                    icon: "success",
                    title: "OTP SENT",
                    text:res.message,
                    showCancelButton: false,
                    showConfirmButton: false,
                    timer: 1200,
                });
                window.location.href = "/user/loadForgetPassOtp";
            }else{
                Swal.fire({
                    icon: "error",
                    title: " FAILD TO SENT OTP",
                    text:res.message,
                    showCancelButton: false,
                    showConfirmButton: false,
                    timer: 1200,
                });
            }
           
        })
        .catch((err) => {
            Swal.fire({
                icon: "error",
                title: "Error In OTP SENT",
                text:err.message,
                showCancelButton: false,
                showConfirmButton: false,
                timer: 1200,
            });
        });
}

// Attach the `forgetPass` function to the form's submit event
const form = document.getElementById('resetForm');
form.addEventListener('submit', forgetPass);
