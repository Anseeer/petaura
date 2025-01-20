
// form validation of the ParentCategory
const parent_name = document.getElementById("name");
const parent_description = document.getElementById("description"); 
const editCategory = document.getElementById("editCategory");
const err_1 = document.getElementById("error1")
const err_2 = document.getElementById("error2")

async function parent_nameValidation() {
    const nameVal = parent_name.value;
    const namePattern = /^[a-zA-Z\s]+$/;

    if (nameVal.trim() === "") {
        err_1.style.display = "block";
        err_1.innerHTML = "Please Enter Category Name";
    } else if (!namePattern.test(nameVal)) {
        err_1.style.display = "block";
        err_1.innerHTML = "Name Only Allowed Alphabets";
    }else {
       
            err_1.style.display = "none";
            err_1.innerHTML = "";
        }
    }

function parent_descriptionValidation() {
    const desVal = parent_description.value;
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
    editCategory.addEventListener("submit", function (e) {
          parent_nameValidation();
            parent_descriptionValidation();

        // Prevent form submission if any validation fails
        if (err_1.innerHTML || err_2.innerHTML ) {
            e.preventDefault(); // Prevent form submission
            console.log("Form validation failed.");
        } else {
            console.log("Form validation passed.");
        }
    });
});
