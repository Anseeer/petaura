 // Timer for redirect
 let countdown = 5; // Timer starts at 3 seconds
 const countdownElement = document.getElementById('countdown');
 const redirectLink = document.getElementById('redirectLink');
 
 const timer = setInterval(() => {
   countdown--; // Decrement countdown
   countdownElement.textContent = countdown;

   // When the countdown reaches 0
   if (countdown === 0) {
     clearInterval(timer); // Stop the timer
     window.location.href = '/user/orderHistory'; // Redirect to another page
   }
 }, 1000); // Run every 1 second