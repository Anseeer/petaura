let timeLeft = 60;
const timerElement = document.getElementById('timer');

let countdown;
startTimer();

function startTimer() {
    clearInterval(countdown);
    countdown = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(countdown);
            timerElement.textContent = '00:00';
        } else {
            let minutes = Math.floor(timeLeft / 60);
            let seconds = timeLeft % 60;
            timerElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            timeLeft--;
        }
    }, 1000);
};


function validateOTPform() {
    const otpInput = document.getElementById("otp").value;

    if (timeLeft <= 0) {
        Swal.fire({
            icon: "error",
            title: "Time Expired",
            text: "Please click Resend OTP to get a new code.",
            showCancelButton: false,
        });
        return false;
    }

    fetch("/verify-Otp", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otp: otpInput })
    })
        .then(response => {
            console.log("Response received:", response);
            return response.json();
        })
        .then(response => {
            console.log("Parsed response:", response);
            if (response.success) {
                Swal.fire({
                    icon: "success",
                    title: "Verified OTP",
                    showCancelButton: false,
                    timer: 1500
                }).then(() => {
                    window.location.href = "/";
                });
            } else {
                console.log("Invalid otp");
                Swal.fire({
                    icon: "error",
                    title: "Invalid OTP",
                    showCancelButton: false,
                    text: response.message,
                    timer: 1500
                });
            }
        })
        .catch(error => {
            console.log("Error in verification of the otp");
            Swal.fire({
                icon: "error",
                title: "ERROR",
                text: error.message,
                timer: 1500
            });

        });

    return false;
}


function resendOTP() {
    if (timeLeft == 0) {
        clearInterval(countdown);
        timeLeft = 60;
        startTimer();

        fetch("/resend-Otp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            }
        })
            .then(response => response.json())
            .then(response => {
                if (response.success) {
                    Swal.fire({
                        icon: "success",
                        title: "OTP Resend ",
                        showCancelButton: false,
                        text: response.message,
                        timer: 1500
                    })
                }
            })
            .catch(error => {
                Swal.fire({
                    icon: "error",
                    title: "Faild To Resend OTP",
                    text: error.message,
                    showCancelButton: false,
                    timer: 1500
                })
            })
    } else {
        Swal.fire({
            icon: "warning",
            title: "Resend after the expired time limit",
            showConfirmButton: false,
            showCancelButton: false,
            timer: 1200,
        });

    }
}  
