
function viewImage(event, index) {
    const input = event.target;
    const reader = new FileReader();

    reader.onload = function () {
        const dataUrl = reader.result;
        const originalImage = document.getElementById("viewimg" + index);
        originalImage.src = dataUrl;


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

            // Generate cropped data URL
            const croppedDataUrl = croppedCanvas.toDataURL("image/png");
            croppedImage.src = croppedDataUrl;

            // Update input file element with cropped image
            croppedCanvas.toBlob((blob) => {
                const fileName = `cropped-img-${Date.now()}-${index}.png`;
                const imgFile = new File([blob], fileName, { type: "image/png" });

                const inputFile = document.getElementById("input" + index);
                const fileList = new DataTransfer();
                fileList.items.add(imgFile);
                inputFile.files = fileList.files;
            });

            // Hide the original image
            originalImage.style.display = "none";

            // Show cropped image container
            const croppedContainer = document.querySelector(
                "#croppedImg" + index
            ).parentNode;
            croppedContainer.style.display = "block";

            cropper.destroy(); // Destroy cropper after saving
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
    const quantity = document.getElementById("quantity");
    const offer = document.getElementById("offer");
    const addproductForm = document.getElementById("addproductForm");
    const err1 = document.getElementById("err-1");
    const err2 = document.getElementById("err-2");
    const err3 = document.getElementById("err-3");
    const err4 = document.getElementById("err-4");
    const err5 = document.getElementById("err-5");
    const err6 = document.getElementById("err-6");
    const err7 = document.getElementById("err-7");
    const err8 = document.getElementById("err-8");
    const err9 = document.getElementById("err-9");

    function nameValidation(e){
        const nameVal = name.value;
        const namePattern = /^[A-Za-z$&\s-_'"/|\/]+$/;

        if(nameVal.trim() == ""){
            err1.style.display ="block";
            err1.innerHTML="Please Enter Valid Name";
        }

        else if(!namePattern.test(nameVal)){
            err1.style.display="block";
            err1.innerHTML = "Name Can Only Contain Alphebetics";
        }

        else{
            err1.style.display="none";
            err1.innerHTML="";
        }

    }

    function descriptionValidation(e){
        const descriptionVal = description.value;
        const descriptionPattern = /^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[%$#@\-+_=\*]).+$/;

        if(descriptionVal.trim()==""){
            err2.style.display="block";
            err2.innerHTML="Please Enter Description About The Product ";
        }else{
            err2.style.display="none";
            err2.innerHTML="";
        }
    }

    function input1Validation(e){
        const imgVal = images1.value;
        const imgPattern = /^.*\.(jpg|jpeg|png|gif|webp|bmp|JPG|JPEG|PNG|GIF|WEBP|BMP)$/;

        if(imgVal.trim()==""){
            err3.style.display="block";
            err3.innerHTML="File not Uploadedd"
        }else if(!imgPattern.test(imgVal)){
            err3.style.display="block";
            err3.innerHTML="Invalid File Format ";
        }else{
            err3.style.display="none";
            err3.innerHTML="";
        }
    };

    function input2Validation(e){
        const imgVal = images2.value;
        const imgPattern = /^.*\.(jpg|jpeg|png|gif|webp|bmp|JPG|JPEG|PNG|GIF|WEBP|BMP)$/;

        if(imgVal.trim()==""){
            err4.style.display="block";
            err4.innerHTML="File not Uploadedd"
        }else if(!imgPattern.test(imgVal)){
            err4.style.display="block";
            err4.innerHTML="Invalid File Format ";
        }else{
            err4.style.display="none";
            err4.innerHTML="";
        }
    };

    function input3Validation(e){
        const imgVal = images3.value;
        const imgPattern = /^.*\.(jpg|jpeg|png|gif|webp|bmp|JPG|JPEG|PNG|GIF|WEBP|BMP)$/;

        if(imgVal.trim()==""){
            err5.style.display="block";
            err5.innerHTML="File not Uploadedd"
        }else if(!imgPattern.test(imgVal)){
            err5.style.display="block";
            err5.innerHTML="Invalid File Format ";
        }else{
            err5.style.display="none";
            err5.innerHTML="";
        }
    };

    function salePriceValidation(e){
        const saleVal = salePrice.value;
        const salePattern = /^\d+(\.\d{1,2})?$/;

        if(saleVal.trim()==""){
            err7.style.display="block";
            err7.innerHTML="Please Enter The SalePrice";
        }else if (!salePattern.test(saleVal)){
            err7.style.display="block";
            err7.innerHTML="Price Only Allowed Numnbers";
        }else{
            err7.style.display="none";
            err7.innerHTML=""
        }
    };

    function regularPriceValidation(e){
        const regVal = regularPrice.value;
        const regPattern = /^\d+(\.\d{1,2})?$/;

        if(regVal.trim()==""){
            err6.style.display="block";
            err6.innerHTML="Please Enter The RegularPrice";
        }else if (!regPattern.test(regVal)){
            err6.style.display="block";
            err6.innerHTML="Price Only Allowed Numnbers";
        }else{
            err6.style.display="none";
            err6.innerHTML=""
        }
    };

    function colorValidation(e){
        const colorVal = color.value;
        const colorPattern = /^[a-zA-Z()\-_\s]+$/ ;

        if(colorVal.trim()==""){
            err8.style.display="block";
            err8.innerHTML="Please Enter Color";
        }else if(!colorPattern.test(colorVal)){
            err8.style.display="block";
            err8.innerHTML="Color only Allowed Alphebetics";
        }else{
            err8.style.display="none";
            err8.innerHTML=""
        }
    }

    function offerValidation(e){
        const offVal = offer.value;
        const offPattern = /^\d+(\.\d{1,2})?$/;

        if(offVal.trim()==""){
            err9.style.display="block";
            err9.innerHTML="Please Enter Offer";
        }else if (!offPattern.test(offVal)){
            err9.style.display="block";
            err9.innerHTML="Offer Only Allowed Number";
        }else{
            err9.style.display="none";
            err9.innerHTML=""
        }
    }



    document.addEventListener("DOMContentLoaded",function(){
        addproductForm.addEventListener("submit",function(e){
            nameValidation();
            descriptionValidation();
            input1Validation();
            input2Validation();
            input3Validation();
            regularPriceValidation();
            salePriceValidation();
            colorValidation();
            offerValidation();

            if(!name ||
                !description||
                !images1 ||
                !images2 ||
                !images3 ||
                !salePrice||
                !regularPrice||
                !quantity ||
                !color ||
                !offer ||
                !addproductForm||
                !err1 ||
                !err2 ||
                !err3 ||
                !err4 ||
                !err5 ||
                !err6 ||
                !err7 ||
                !err8 ||
                !err9 

            ){
                res.status(400).send("error element not found ");
            }

            if( err1.innerHTML ||
                err2.innerHTML ||
                err3.innerHTML ||
                err4.innerHTML ||
                err5.innerHTML ||
                err6.innerHTML ||
                err7.innerHTML ||
                err8.innerHTML ||
                err9.innerHTML 
            ){
                e.preventDefault();
            }
        });
    });

