document.addEventListener("DOMContentLoaded", function () {
    const name = document.getElementById("name");
    const parent = document.getElementById("parent");
    const description = document.getElementById("description");
    const err1 = document.getElementById("error1");
    const err2 = document.getElementById("error2");
    const err3 = document.getElementById("error3");
    const addCategoryForm = document.getElementById("addCategoryForm");

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

        if (parentVal.trim() === "") {
            err2.style.display = "block";
            err2.innerHTML = "Please Select a Parent Category";
        } else {
            err2.style.display = "none";
            err2.innerHTML = "";
        }
    }

    function descriptionValidation() {
        const desVal = description.value;

        if (desVal.trim() === "") {
            err3.style.display = "block";
            err3.innerHTML = "Please Enter Description";
        } else {
            err3.style.display = "none";
            err3.innerHTML = "";
        }
    }

    addCategoryForm.addEventListener("submit", function (e) {
        e.preventDefault(); // Prevent default form submission

        nameValidation();
        parentValidation();
        descriptionValidation();

        // Check if any validation failed
        if (err1.innerHTML || err2.innerHTML || err3.innerHTML) {
            return; // Do not proceed further
        }

        addCategory(); // Call the function to submit the form data
    });

    function addCategory() {
        const name = document.getElementById("name").value;
        const parent = document.getElementById("parent").value;
        const offer = document.getElementById("offer").value;
        const description = document.getElementById("description").value;


        fetch("/admin/addCategory", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, parent, offer, description })
        })
        .then((response) => response.json())
        .then((response) => {
            if (response.success) {
                Swal.fire({
                    icon: "success",
                    title: "Added",
                    showCancelButton: false,
                    showConfirmButton: false,
                    text: response.message,
                    timer: 1500
                });
                window.location.href = "/admin/category";
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Failed To Add",
                    showCancelButton: false,
                    showConfirmButton: false,
                    text: response.message,
                    timer: 1500
                });
            }
        })
        .catch(() => {
            Swal.fire({
                icon: "error",
                title: "Error",
                showCancelButton: false,
                showConfirmButton: false,
                timer: 1500
            });
        });
    }
});