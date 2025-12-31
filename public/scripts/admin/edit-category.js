
const name = document.getElementById("name");
const parent = document.getElementById("parent");
const description = document.getElementById("description");
const err1 = document.getElementById("error1");
const err2 = document.getElementById("error2");
const err3 = document.getElementById("error3");
const editCategory = document.getElementById("editCategory");

function nameValidation() {
    const nameVal = name.value;
    const namePattern = /^[a-zA-Z\s]+$/;

    if (nameVal.trim() === "") {
        err1.style.display = "block";
        err1.innerHTML = "Please Enter Category Name";
    } else if (!namePattern.test(nameVal)) {
        err1.style.display = "block";
        err1.innerHTML = "Name Only Allowed Alphabets";
    } else {
        err1.style.display = "none";
        err1.innerHTML = "";
    }
}

function parentValidation() {
    const parentVal = parent.value;
    const parentPattern = /^[a-zA-Z\s]+$/;

    if (parentVal.trim() === "") {
        err2.style.display = "block";
        err2.innerHTML = "Please Enter Parent Category";
    } else {
        err2.style.display = "none";
        err2.innerHTML = "";
    }
}

function descriptionValidation() {
    const desVal = description.value;
    const desPattern = /^[a-zA-Z\s]+$/;

    if (desVal.trim() === "") {
        err3.style.display = "block";
        err3.innerHTML = "Please Enter Description";
    } else if (!desPattern.test(desVal)) {
        err3.style.display = "block";
        err3.innerHTML = "Description Only Allowed Alphabets";
    } else {
        err3.style.display = "none";
        err3.innerHTML = "";
    }
}

document.addEventListener("DOMContentLoaded", function () {
    editCategory.addEventListener("submit", function (e) {
        nameValidation();
        parentValidation();
        descriptionValidation();

        if (err1.innerHTML || err2.innerHTML || err3.innerHTML) {
            e.preventDefault();
            console.log("Form validation failed.");
        } else {
            console.log("Form validation passed.");
        }
    });
});
