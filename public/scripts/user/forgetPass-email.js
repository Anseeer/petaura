

function forgetPass(e) {
    console.log("hey");
    e.preventDefault();
    const emailInput = document.getElementById("email");
    const emailError = document.getElementById("emailError");
    const email = emailInput.value.trim();
    const emailPattern = /^[a-z0-9._%+-]+@gmail\.com$/;

    if (!emailPattern.test(email)) {
        emailError.style.display = 'block';
        return;
    } else {
        emailError.style.display = 'none';
    }

    console.log("Email:", email);
    fetch("/forget-pass", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
    })
        .then((res) => res.json())
        .then((res) => {
            if (res.success) {
                Swal.fire({
                    icon: "success",
                    title: "OTP SENT",
                    text: res.message,
                    showCancelButton: false,
                    showConfirmButton: false,
                    timer: 1500,
                });
                window.location.href = "/loadForgetPassOtp";
            } else {
                Swal.fire({
                    icon: "error",
                    title: " FAILD TO SENT OTP",
                    text: res.message,
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
                text: err.message,
                showCancelButton: false,
                showConfirmButton: false,
                timer: 1200,
            });
        });
}

const form = document.getElementById('resetForm');
form.addEventListener('submit', forgetPass);
