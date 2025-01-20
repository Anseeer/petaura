function closeEditAddress() {
    window.history.back();
  }

  document.getElementById("editAddressForm").addEventListener("submit", function(event) {
    let isValid = true;

    // Clear previous error messages
    document.querySelectorAll("small.text-danger").forEach(error => error.innerText = "");

    // Get input values
    const addressType = document.getElementById("addressType").value.trim();
    const name = document.getElementById("name").value.trim();
    const country = document.getElementById("country").value.trim();
    const state = document.getElementById("state").value.trim();
    const pincode = document.getElementById("pincode").value.trim();
    const phone = document.getElementById("phone").value.trim();

    // Validation patterns
    const textPattern = /^[A-Za-z\s]+$/;
    const pincodePattern = /^\d{6}$/;
    const phonePattern = /^\d{10}$/;

    // Address Type validation
    if (!textPattern.test(addressType)) {
      document.getElementById("addressTypeError").innerText = "Please enter a valid address type.";
      isValid = false;
    }

    // Name validation
    if (!textPattern.test(name)) {
      document.getElementById("nameError").innerText = "Please enter a valid name.";
      isValid = false;
    }

    // Country validation
    if (!textPattern.test(country)) {
      document.getElementById("countryError").innerText = "Please enter a valid country.";
      isValid = false;
    }

    // State validation
    if (!textPattern.test(state)) {
      document.getElementById("stateError").innerText = "Please enter a valid state.";
      isValid = false;
    }

    // Pincode validation
    if (!pincodePattern.test(pincode)) {
      document.getElementById("pincodeError").innerText = "Please enter a valid 6-digit pincode.";
      isValid = false;
    }

    // Phone validation
    if (!phonePattern.test(phone)) {
      document.getElementById("phoneError").innerText = "Please enter a valid 10-digit phone number.";
      isValid = false;
    }

    if (!isValid) event.preventDefault();
  });