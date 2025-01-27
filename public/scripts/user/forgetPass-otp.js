let otpTimerInterval;
let timer = 60;
let otpExpired = false; 

function startOtpTimer() {
     otpExpired = false; 
    const timerElement = document.getElementById("timer");
    otpTimerInterval = setInterval(function () {
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;
        timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        if (timer <= 0) {
             otpExpired = true; 
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
    event.preventDefault(); // Prevent default behavior regardless of conditions

    if (otpExpired) { // Check if the timer has expired
        const timerElement = document.getElementById("timer");
        clearInterval(otpTimerInterval); // Clear any existing interval
        timer = 60; // Reset timer to 60 seconds
        timerElement.style.color = "black"; // Reset timer color
        otpExpired = false; // Reset the expiry flag
        startOtpTimer(); // Start a new timer countdown

        try {
            const response = await fetch("/resendOtp-ForgetPass", {
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
                text: `Failed to resend OTP. Try again later. (${error.message})`,
            });
        }
    } else {
        Swal.fire({
            icon: "warning",
            title: `Please wait for ${timer} seconds to resend OTP`,
            showConfirmButton: false,
            timer: 1200, // Display the warning for 1.2 seconds
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
        const response = await fetch("/resetPass", {
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
                window.location.href = "/reset-password"; // Redirect on success
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