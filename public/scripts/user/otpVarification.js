 // Timer functionality
 let timeLeft = 60;
 const timerElement = document.getElementById('timer');
 // const otpInput = document.getElementById("otp");

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


// Validate OTP form logic
function validateOTPform() {
const otpInput = document.getElementById("otp").value;

// Check if the OTP time has expired
if (timeLeft <= 0) {
 Swal.fire({
     icon: "error",
     title: "Time Expired",
     text: "Please click Resend OTP to get a new code.",
     showCancelButton:false,
 });
 return false; // Stop the function
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
return response.json(); // Make sure response is parsed into JSON
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
} else{
 console.log("Invalid otp");
 Swal.fire({
 icon: "error",
 title: "Invalid OTP",
 showCancelButton: false,
 text:response.message,
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

return false; // Prevent form submission
}


function resendOTP() {
    if(timeLeft == 0){
        clearInterval(countdown); // Clear any existing timer
        timeLeft = 60; // Reset the timer
        startTimer(); // Start a new timer
        
        fetch("/resend-Otp",{
        method:"POST",
        headers:{
         "Content-Type":"application/json",
        }
        })
        .then(response => response.json())
        .then(response =>{
        if(response.success){
         Swal.fire({
             icon:"success",
             title:"OTP Resend ",
             showCancelButton: false,
             text:response.message,
             timer:1500
         })
        }
        })
        .catch(error =>{
        Swal.fire({
         icon:"error",
         title:"Faild To Resend OTP",
         text:response.message,
         showCancelButton: false,
         timer:1500
        })
        })
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
