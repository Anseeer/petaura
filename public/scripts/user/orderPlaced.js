let countdown = 3;
const countdownElement = document.getElementById('countdown');
const redirectLink = document.getElementById('redirectLink');

const timer = setInterval(() => {
  countdown--;
  countdownElement.textContent = countdown;

  if (countdown === 0) {
    clearInterval(timer);
    window.location.href = '/orderHistory';
  }
}, 1000);