

function addParentCategory(event) {
    event.preventDefault();
    const name = document.getElementById("parent_name").value;
    const description = document.getElementById("parent_description").value;

    fetch("/admin/addParentCategory", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description })
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
                })
                window.location.href = "/admin/parentCategories"
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Faild To Add",
                    showCancelButton: false,
                    showConfirmButton: false,
                    text: response.message,
                    timer: 1500
                })
            }
        })
        .catch(() => {
            Swal.fire({
                icon: "error",
                title: "Error",
                showCancelButton: false,
                showConfirmButton: false,
                timer: 1500
            })
        })


}

const Parent_name = document.getElementById("parent_name");
const Parent_description = document.getElementById("parent_description");
const addParentCategoryForm = document.getElementById("addParentCategoryForm");
const err_1 = document.getElementById("err1")
const err_2 = document.getElementById("err2")

function Parent_nameValidation() {
    const nameVal = Parent_name.value;
    const namePattern = /^[a-zA-Z\s]+$/;

    if (nameVal.trim() === "") {
        err_1.style.display = "block";
        err_1.innerHTML = "Please Enter Category Name";
    } else if (!namePattern.test(nameVal)) {
        err_1.style.display = "block";
        err_1.innerHTML = "Name Only Allowed Alphabets";
    } else {
        err_1.style.display = "none";
        err_1.innerHTML = "";
    }
}

function Parent_descriptionValidation() {
    const desVal = Parent_description.value;
    const desPattern = /^[a-zA-Z\s]+$/;

    if (desVal.trim() === "") {
        err_2.style.display = "block";
        err_2.innerHTML = "Please Enter Description";
    } else if (!desPattern.test(desVal)) {
        err_2.style.display = "block";
        err_2.innerHTML = "Description Only Allowed Alphabets";
    } else {
        err_2.style.display = "none";
        err_2.innerHTML = "";
    }
}


document.addEventListener("DOMContentLoaded", function () {
    addParentCategoryForm.addEventListener("submit", function (e) {
        Parent_nameValidation();
        Parent_descriptionValidation();

        if (err_1.innerHTML || err_2.innerHTML) {
            e.preventDefault();
        } else {
        }
    });
});