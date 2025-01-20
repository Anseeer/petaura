// Function to toggle password visibility
function togglePasswordVisibility(passwordInputId, toggleIconId) {
    const passwordInput = document.getElementById(passwordInputId);
    const toggleIcon = document.getElementById(toggleIconId).querySelector("i");
    
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      toggleIcon.classList.remove("fa-eye-slash");
      toggleIcon.classList.add("fa-eye");
    } else {
      passwordInput.type = "password";
      toggleIcon.classList.remove("fa-eye");
      toggleIcon.classList.add("fa-eye-slash");
    }
  }

  // Attach event listeners for both password fields
  document.getElementById("togglePassword").addEventListener("click", () => {
    togglePasswordVisibility("password", "togglePassword");
  });

  document.getElementById("toggleConfirmPassword").addEventListener("click", () => {
    togglePasswordVisibility("confirmPassword", "toggleConfirmPassword");
  });

const nameId = document.getElementById("name");
const emailId = document.getElementById("email");
const phoneId = document.getElementById("phone");
const passwordId = document.getElementById("password");
const confirmPasswordId = document.getElementById("confirmPassword");
const error1 = document.getElementById("error1");
const error2 = document.getElementById("error2");
const error3 = document.getElementById("error3");
const error4 = document.getElementById("error4");
const error5 = document.getElementById("error5");
const signform = document.getElementById("signform");
function nameValidation() {
const nameval = nameId.value.trim();
const namePattern = /^[a-zA-Z\s]+$/;

if (!nameval) {
  error1.style.display = "block";
  error1.innerHTML = "Please enter a valid name";
} else if (!namePattern.test(nameval)) {
  error1.style.display = "block";
  error1.innerHTML = "Name can only contain alphabets";
} else {
  error1.style.display = "none";
  error1.innerHTML = ""; // Clear error message
}
}

function emailValidation() {
const emailval = emailId.value.trim();
const emailPattern = /^[a-z0-9._%+-]+@gmail\.com$/;

if (!emailval) {
  error2.style.display = "block";
  error2.innerHTML = "Please enter a valid email";
} else if (!emailPattern.test(emailval)) {
  error2.style.display = "block";
  error2.innerHTML = "Enter a valid email";
} else {
  error2.style.display = "none";
  error2.innerHTML = "";
}
}

function phoneValidation() {
const phoneval = phoneId.value.trim();
const phonePattern = /^[1-9]{1}[0-9]{9}$/;

if (!phoneval) {
  error3.style.display = "block";
  error3.innerHTML = "Please enter a number";
} else if (!phonePattern.test(phoneval) || /^0+$/.test(phoneval)) {
  error3.style.display = "block";
  error3.innerHTML = "Enter a valid 10-digit number (cannot start with 0 or be all zeros)";
} else {
  error3.style.display = "none";
  error3.innerHTML = "";
}
}

function passwordValidation() {
const passval = passwordId.value.trim();
const confirmPassVal = confirmPasswordId.value.trim();
const passPattern = /^.{6,}$/;

if (!passval) {
  error4.style.display = "block";
  error4.innerHTML = "Please enter a password";
} else if (!passPattern.test(passval)) {
  error4.style.display = "block";
  error4.innerHTML = "Password must be at least 6 characters long";
} else {
  error4.style.display = "none";
  error4.innerHTML = "";
}

if (!confirmPassVal) {
  error5.style.display = "block";
  error5.innerHTML = "Confirm password cannot be empty";
} else if (passval !== confirmPassVal) {
  error5.style.display = "block";
  error5.innerHTML = "Passwords do not match";
} else {
  error5.style.display = "none";
  error5.innerHTML = "";
}
}

document.addEventListener("DOMContentLoaded", function () {
signform.addEventListener("submit", function (e) {
  nameValidation();
  emailValidation();
  phoneValidation();
  passwordValidation();

  // Prevent form submission if any error is displayed
  if (
      error1.style.display === "block" ||
      error2.style.display === "block" ||
      error3.style.display === "block" ||
      error4.style.display === "block" ||
      error5.style.display === "block"
  ) {
      e.preventDefault();
  }
});
});


document.addEventListener("DOMContentLoaded", function () {
signform.addEventListener("submit", function (e) {
  nameValidation();
  emailValidation();
  phoneValidation();
  passwordValidation();
  confirmPasswordValidation();

  // Prevent form submission if any errors exist
  if (
      error1.style.display === "block" ||
      error2.style.display === "block" ||
      error3.style.display === "block" ||
      error4.style.display === "block" ||
      error5.style.display === "block"
  ) {
      e.preventDefault();
  }
});
});

const queryParams = new URLSearchParams(window.location.search);
const referralCode = queryParams.get('ref');

document.addEventListener('DOMContentLoaded', () => {
const referralInput = document.getElementById('refCode');
if (referralCode) {
referralInput.value = referralCode; 
}
});


