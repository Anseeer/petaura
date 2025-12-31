
function viewImage1(event) {
    document.getElementById("viewimg1").src = URL.createObjectURL(event.target.files[0]);

}

function viewImage2(event) {
    document.getElementById("viewimg1").src = URL.createObjectURL(event.target.files[0]);
}

function viewImage3(event) {
    document.getElementById("viewimg1").src = URL.createObjectURL(event.target.files[0]);
}

function viewImage(event, index) {
    const input = event.target;
    const reader = new FileReader();

    reader.onload = function () {
        const dataUrl = reader.result;
        const originalImage = document.getElementById("viewimg" + index);
        originalImage.src = dataUrl;
        // 
        let cropper = new Cropper(originalImage, {
            aspectRatio: 1,
            viewMode: 1,
            guides: true,
            background: false,
            autoCropArea: 1,
            zoomable: true,
        });

        const saveButton = document.getElementById("saveButton" + index);
        saveButton.addEventListener("click", function () {
            const croppedCanvas = cropper.getCroppedCanvas();
            const croppedImage = document.getElementById("croppedImg" + index);

            const croppedDataUrl = croppedCanvas.toDataURL("image/png");
            croppedImage.src = croppedDataUrl;

            croppedCanvas.toBlob((blob) => {
                const fileName = `cropped-img-${Date.now()}-${index}.png`;
                const imgFile = new File([blob], fileName, { type: "image/png" });

                const inputFile = document.getElementById("input" + index);
                const fileList = new DataTransfer();
                fileList.items.add(imgFile);
                inputFile.files = fileList.files;
            });

            originalImage.style.display = "none";

            const croppedContainer = document.querySelector(
                "#croppedImg" + index
            ).parentNode;
            croppedContainer.style.display = "block";

            cropper.destroy();
        });
    };

    reader.readAsDataURL(input.files[0]);
}

// Form validation 
const name = document.getElementById("product_name");
const description = document.getElementById("description");
const images1 = document.getElementById("input1");
const images2 = document.getElementById("input2");
const images3 = document.getElementById("input3");
const salePrice = document.getElementById("salePrice");
const regularPrice = document.getElementById("regularPrice");
const color = document.getElementById("color");
const offer = document.getElementById("offer");
const quantity = document.getElementById("quantity");
const editProductForm = document.getElementById("editProductForm");
const err1 = document.getElementById("err-1");
const err2 = document.getElementById("err-2");
const err3 = document.getElementById("err-3");
const err4 = document.getElementById("err-4");
const err5 = document.getElementById("err-5");
const err6 = document.getElementById("err-6");
const err7 = document.getElementById("err-7");
const err8 = document.getElementById("err-8");
const err9 = document.getElementById("err-9");
const err10 = document.getElementById("err-10");

function nameValidation(e) {
    const nameVal = name.value;
    const namePattern = /^[A-Za-z$&\s-_]+$/;


    if (nameVal.trim() == "") {
        err1.style.display = "block";
        err1.innerHTML = "Please Enter Valid Name";
    }

    else if (!namePattern.test(nameVal)) {
        err1.style.display = "block";
        err1.innerHTML = "Name Can Only Contain Alphebetics";
    }

    else {
        err1.style.display = "none";
        err1.innerHTML = "";
    }

}

function descriptionValidation(e) {
    const descriptionVal = description.value;
    const descriptionPattern = /^(?=.*\bcat\b)(?=.*\bmice\b)(?=.*\btoy\b)(?=.*\bsqueaky\b)(?=.*\bsensors\b)(?=.*\bobstacles\b)(?=.*\binteractive\b)(?=.*\bbattery\b).*$ /;


    if (descriptionVal.trim() == "") {
        err2.style.display = "block";
        err2.innerHTML = "Please Enter Description About The Product ";

    } else {
        err2.style.display = "none";
        err2.innerHTML = "";
    }
}
function input1Validation(e) {
    const imgVal = images1.value;
    const existingImg = "<%= product.Image[0] %>";

    const imgPattern = /^.*\.(jpg|jpeg|png|gif|webp|bmp|JPG|JPEG|PNG|GIF|WEBP|BMP)$/;

    if (imgVal.trim() === "" && !existingImg) {
        err3.style.display = "block";
        err3.innerHTML = "File not uploaded";
    } else if (imgVal.trim() !== "" && !imgPattern.test(imgVal)) {
        err3.style.display = "block";
        err3.innerHTML = "Invalid file format";
    } else {
        err3.style.display = "none";
        err3.innerHTML = "";
    }
}

function input2Validation(e) {
    const imgVal = images2.value;
    const existingImg = "<%= product.Image[1] %>";

    const imgPattern = /^.*\.(jpg|jpeg|png|gif|webp|bmp|JPG|JPEG|PNG|GIF|WEBP|BMP)$/;

    if (imgVal.trim() === "" && !existingImg) {
        err4.style.display = "block";
        err4.innerHTML = "File not uploaded";
    } else if (imgVal.trim() !== "" && !imgPattern.test(imgVal)) {
        err4.style.display = "block";
        err4.innerHTML = "Invalid file format";
    } else {
        err4.style.display = "none";
        err4.innerHTML = "";
    }
}

function input3Validation(e) {
    const imgVal = images3.value;
    const existingImg = "<%= product.Image[2] %>";

    const imgPattern = /^.*\.(jpg|jpeg|png|gif|webp|bmp|JPG|JPEG|PNG|GIF|WEBP|BMP)$/;

    if (imgVal.trim() === "" && !existingImg) {
        err5.style.display = "block";
        err5.innerHTML = "File not uploaded";
    } else if (imgVal.trim() !== "" && !imgPattern.test(imgVal)) {
        err5.style.display = "block";
        err5.innerHTML = "Invalid file format";
    } else {
        err5.style.display = "none";
        err5.innerHTML = "";
    }
}

function salePriceValidation(e) {
    const saleVal = salePrice.value;
    const salePattern = /^\d+(\.\d{1,2})?$/;

    if (saleVal.trim() == "") {
        err7.style.display = "block";
        err7.innerHTML = "Please Enter The SalePrice";
    } else if (!salePattern.test(saleVal)) {
        err7.style.display = "block";
        err7.innerHTML = "Price Only Allowed Numnbers";
    } else {
        err7.style.display = "none";
        err7.innerHTML = ""
    }
};

function regularPriceValidation(e) {
    const regVal = regularPrice.value;
    const regPattern = /^\d+(\.\d{1,2})?$/;

    if (regVal.trim() == "") {
        err6.style.display = "block";
        err6.innerHTML = "Please Enter The regularPrice";
    } else if (!regPattern.test(regVal)) {
        err6.style.display = "block";
        err6.innerHTML = "Price Only Allowed Numnbers";
    } else {
        err6.style.display = "none";
        err6.innerHTML = ""
    }
};

function colorValidation(e) {
    const colorVal = color.value;
    const colorPattern = /^[a-zA-Z()\-_\s]+$/;

    if (colorVal.trim() == "") {
        err8.style.display = "block";
        err8.innerHTML = "Please Enter Color";
    } else if (!colorPattern.test(colorVal)) {
        err8.style.display = "block";
        err8.innerHTML = "Color only Allowed Alphebetics";
    } else {
        err8.style.display = "none";
        err8.innerHTML = ""
    }
}

function offerValidation(e) {
    const offVal = offer.value;
    const offPattern = /^\d+(\.\d{1,2})?$/;

    if (offVal.trim() == "") {
        err9.style.display = "block";
        err9.innerHTML = "Please Enter Offer";
    } else if (!offPattern.test(offVal)) {
        err9.style.display = "block";
        err9.innerHTML = "Offer Only Allowed Number";
    } else {
        err9.style.display = "none";
        err9.innerHTML = ""
    }
}

function quantityValidation(e) {
    const quanVal = quantity.value;
    const quanPattern = /^\d+(\.\d{1,2})?$/;

    if (quanVal.trim() == "") {
        err10.style.display = "block";
        err10.innerHTML = "Please Enter Offer";
    } else if (!quanPattern.test(quanVal)) {
        err10.style.display = "block";
        err10.innerHTML = "Offer Only Allowed Number";
    } else {
        err10.style.display = "none";
        err10.innerHTML = ""
    }

}


document.addEventListener("DOMContentLoaded", function () {
    editProductForm.addEventListener("submit", function (e) {

        nameValidation();
        descriptionValidation();
        input1Validation();
        input2Validation();
        input3Validation();
        regularPriceValidation();
        salePriceValidation();
        colorValidation();
        offerValidation();
        quantityValidation();


        if (err1.innerHTML ||
            err2.innerHTML ||
            err3.innerHTML ||
            err4.innerHTML ||
            err5.innerHTML ||
            err6.innerHTML ||
            err7.innerHTML ||
            err8.innerHTML ||
            err9.innerHTML ||
            err10.innerHTML
        ) {
            e.preventDefault();
        }
    });
});


