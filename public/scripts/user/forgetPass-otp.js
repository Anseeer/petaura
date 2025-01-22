let otpTimerInterval;
let timer = 60;

function startOtpTimer() {
    const timerElement = document.getElementById("timer");
    otpTimerInterval = setInterval(function () {
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;
        timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        if (timer <= 0) {
            clearInterval(otpTimerInterval);
            timerElement.textContent = "Expired";
            timerElement.style.color = "red";
        }
        timer--;
    }, 1000);
}

(function initializeOtpTimer() {
    if (otpTimerInterval) {
        clearInterval(otpTimerInterval);
    }
    timer = 60; // Reset timer
    startOtpTimer();
})();

async function resendOtp(event) {
    if(timer == 0){
        event.preventDefault();
    const timerElement = document.getElementById("timer");
    clearInterval(otpTimerInterval);
    timer = 60;
    timerElement.style.color = "black";
    startOtpTimer();

    try {
        const response = await fetch("/user/resendOtp-ForgetPass", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const result = await response.json();
        if (result.success) {
            Swal.fire({
                icon: "success",
                title: "OTP Resent",
                text: result.message,
                timer: 1500,
                showConfirmButton: false,
            });
        } else {
            Swal.fire({
                icon: "error",
                title: "Failed to Resend OTP",
                text: result.message,
            });
        }
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to resend OTP. Try again later.",
        });
    }
    }else{
        Swal.fire({
            icon: "warning", // Corrected icon name
            title: "Resend after the expired time limit",
            showConfirmButton: false, // Corrected spelling
            showCancelButton: false, // Corrected spelling
            timer: 1200, // Time in milliseconds
        });
        
    }
    
}

document.getElementById('otpVerificationForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const otp = document.getElementById('otp').value.trim();
    if (!/^\d{6}$/.test(otp)) {
        Swal.fire({
            icon: "error",
            title: "Invalid OTP",
            text: "OTP must be exactly 6 digits.",
        });
        return;
    }

    if (timer <= 0) {
        Swal.fire({
            icon: "error",
            title: "Time Expired",
            text: "The OTP has expired. Please resend OTP.",
        });
        return;
    }

    try {
        const response = await fetch("/user/resetPass", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ otp }),
        });

        const result = await response.json();
        if (result.success) {
            Swal.fire({
                icon: "success",
                title: "OTP Verified",
                text: "Redirecting...",
                timer: 1500,
                showConfirmButton: false,
            }).then(() => {
                window.location.href = "/user/reset-password"; // Redirect on success
            });
        } else {
            Swal.fire({
                icon: "error",
                title: "Invalid OTP",
                text: result.message,
            });
        }
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Something went wrong. Please try again.",
        });
    }
});