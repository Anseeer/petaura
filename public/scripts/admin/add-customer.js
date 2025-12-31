const nameid = document.getElementById("name");
const emailid = document.getElementById("email");
const passwordid = document.getElementById("password");
const phoneid = document.getElementById("phone");
const err1 = document.getElementById("err-1");
const err2 = document.getElementById("err-2");
const err3 = document.getElementById("err-3");
const err4 = document.getElementById("err-4");
const addCustomer = document.getElementById("addCustomer");

function nameValidation() {
    const nameVal = nameid.value.trim();
    const namePattern = /^[a-zA-Z\s]+$/;

    if (nameVal === "") {
        err1.style.display = "block";
        err1.innerHTML = "Please Enter Name";
        return false;
    } else if (!namePattern.test(nameVal)) {
        err1.style.display = "block";
        err1.innerHTML = "Invalid Name. Name can only contain alphabets.";
        return false;
    } else {
        err1.style.display = "none";
        err1.innerHTML = "";
        return true;
    }
}

function emailValidation() {
    const emailVal = emailid.value.trim();
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (emailVal === "") {
        err2.style.display = "block";
        err2.innerHTML = "Please Enter Email";
        return false;
    } else if (!emailPattern.test(emailVal)) {
        err2.style.display = "block";
        err2.innerHTML = "Invalid Email";
        return false;
    } else {
        err2.style.display = "none";
        err2.innerHTML = "";
        return true;
    }
}

function passwordValidation() {
    const passVal = passwordid.value.trim();
    const passPattern = /^.{6,}$/;

    if (passVal === "") {
        err3.style.display = "block";
        err3.innerHTML = "Please Enter Password";
        return false;
    } else if (!passPattern.test(passVal)) {
        err3.style.display = "block";
        err3.innerHTML = "Password must be at least 6 characters";
        return false;
    } else {
        err3.style.display = "none";
        err3.innerHTML = "";
        return true;
    }
}

function phoneValidation() {
    const phnVal = phoneid.value.trim();
    const phnPattern = /^[0-9]{10}$/;

    if (phnVal === "") {
        err4.style.display = "block";
        err4.innerHTML = "Please Enter Phone Number";
        return false;
    } else if (!phnPattern.test(phnVal)) {
        err4.style.display = "block";
        err4.innerHTML = "Invalid Phone Number. Must be 10 digits.";
        return false;
    } else {
        err4.style.display = "none";
        err4.innerHTML = "";
        return true;
    }
}

document.addEventListener("DOMContentLoaded", function () {
    addCustomer.addEventListener("submit", function (e) {
        const isNameValid = nameValidation();
        const isEmailValid = emailValidation();
        const isPasswordValid = passwordValidation();
        const isPhoneValid = phoneValidation();

        if (!isNameValid || !isEmailValid || !isPasswordValid || !isPhoneValid) {
            e.preventDefault();
        }
    });
});