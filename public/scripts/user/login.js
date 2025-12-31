document.addEventListener("DOMContentLoaded", function () {
    const loginform = document.getElementById("loginform");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const err1 = document.getElementById("err-1");
    const err2 = document.getElementById("err-2");

    document.getElementById("togglePassword").addEventListener("click", function () {
        const passwordInput = document.getElementById("password");
        const passwordIcon = document.getElementById("password-icon");

        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            passwordIcon.classList.remove("fa-eye-slash");
            passwordIcon.classList.add("fa-eye");
        } else {
            passwordInput.type = "password";
            passwordIcon.classList.remove("fa-eye");
            passwordIcon.classList.add("fa-eye-slash");
        }
    });

    function emailValidation() {
        const emailVal = email.value.trim();
        const emailPattern = /^[a-z0-9._%+-]+@gmail\.com$/;

        if (emailVal === "") {
            err1.style.display = "block";
            err1.innerHTML = "Please enter your email.";
            return false;
        } else if (!emailPattern.test(emailVal)) {
            err1.style.display = "block";
            err1.innerHTML = "Invalid email format.";
            return false;
        } else {
            err1.style.display = "none";
            err1.innerHTML = "";
            return true;
        }
    }

    function passValidation() {
        const passVal = password.value.trim();
        const passPattern = /^.{6,}$/;

        if (passVal === "") {
            err2.style.display = "block";
            err2.innerHTML = "Please enter your password.";
            return false;
        } else if (!passPattern.test(passVal)) {
            err2.style.display = "block";
            err2.innerHTML = "Password must be at least 6 characters.";
            return false;
        } else {
            err2.style.display = "none";
            err2.innerHTML = "";
            return true;
        }
    }

    loginform.addEventListener("submit", function (e) {
        const isEmail = emailValidation();
        const isPass = passValidation();

        if (!isEmail || !isPass) {
            e.preventDefault();
        } else {
        }
    });
});