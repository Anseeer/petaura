
function addAddress(event) {
    event.preventDefault();
    const typeOfAddress = document.getElementById("typeOfAddress").value;
    const name = document.getElementById("name").value;
    const country = document.getElementById("country").value;
    const state = document.getElementById("state").value;
    const pincode = document.getElementById("pincode").value;
    const phone = document.getElementById("phone").value;
    const userId = document.getElementById("userId").value;
    const err1 = document.getElementById("err1");
    const err2 = document.getElementById("err2");
    const err3 = document.getElementById("err3");
    const err4 = document.getElementById("err4");
    const err5 = document.getElementById("err5");
    const err6 = document.getElementById("err6");

    const typeOfAddressPattern = /^[A-Za-z\s]+$/;
    if (typeOfAddress.trim() === "") {
        err1.style.display = "block";
        err1.innerHTML = "Please Enter The TypeOfAddress";
    } else if (!typeOfAddressPattern.test(typeOfAddress)) {
        err1.style.display = "block";
        err1.innerHTML = "Only allowed alphebets";
    } else {
        err1.style.display = "none";
        err1.innerHTML = "";
    }

    const namePattern = /^[A-Za-z\s]+$/;
    if (name.trim() === "") {
        err2.style.display = "block";
        err2.innerHTML = "Please Enter Your Name";
    } else if (!namePattern.test(name)) {
        err2.style.display = "block";
        err2.innerHTML = "Only allowed alphebets";
    } else {
        err2.style.display = "none";
        err2.innerHTML = "";
    }

    const countryPattern = /^[A-Za-z\s]+$/;
    if (country.trim() === "") {
        err3.style.display = "block";
        err3.innerHTML = "Please Enter Your Country";
    } else if (!countryPattern.test(country)) {
        err3.style.display = "block";
        err3.innerHTML = "Only allowed alphebets";
    } else {
        err3.style.display = "none";
        err3.innerHTML = "";
    }

    const statePattern = /^[A-Za-z\s]+$/;
    if (state.trim() === "") {
        err4.style.display = "block";
        err4.innerHTML = "Please Enter Your State";
    } else if (!statePattern.test(state)) {
        err4.style.display = "block";
        err4.innerHTML = "Only allowed alphebets";
    } else {
        err4.style.display = "none";
        err4.innerHTML = "";
    }

    const pincodePattern = /^\d{6}$/;
    if (pincode.trim() === "") {
        err5.style.display = "block";
        err5.innerHTML = "Please Enter Your Pincode";
    } else if (!pincodePattern.test(pincode)) {
        err5.style.display = "block";
        err5.innerHTML = "Only allowed Numbers & Must Need Six Number";
    } else {
        err5.style.display = "none";
        err5.innerHTML = "";
    }

    const phnPattern = /^\d{10}$/;
    if (phone.trim() === "") {
        err6.style.display = "block";
        err6.innerHTML = "Please Enter Your PhoneNumber";
    } else if (!phnPattern.test(phone)) {
        err6.style.display = "block";
        err6.innerHTML = "Invalid Number";
    } else {
        err6.style.display = "none";
        err6.innerHTML = "";
    }

    if (err1.innerHTML || err2.innerHTML || err3.innerHTML || err4.innerHTML || err5.innerHTML || err6.innerHTML) {
        return false;
    }

    fetch("/addAddress", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ typeOfAddress, name, country, state, pincode, phone, userId })
    })
        .then((response) => response.json())
        .then((response) => {
            if (response.success) {
                Swal.fire({
                    icon: "success",
                    title: "Add NewAddress",
                    text: response.message,
                    showCancelButton: false,
                    showConfirmButton: false,
                    timer: 1500,
                }).then(() => {
                    window.location.href = "/checkout-page";
                })
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Faild To AddAddress",
                    text: response.message,
                    showCancelButton: false,
                    showConfirmButton: false,
                    timer: 1500,
                })
            }
        })
        .catch((err) => {
            Swal.fire({
                icon: "error",
                title: "ERROR",
                text: err.message || "An unexpected error occurred.",
                showCancelButton: false,
                showConfirmButton: false,
                timer: 1500,
            });
        });


}

function closeEditAddress() {
    window.history.back();
}