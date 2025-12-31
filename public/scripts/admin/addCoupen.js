function codeValidate() {
  const codeValue = document.getElementById("couponCode").value;
  const codePattern = /^#[A-Z]{3}\d{3}$/;
  const err1 = document.getElementById("err1");

  if (codeValue.trim() === "") {
    err1.style.display = "block";
    err1.innerHTML = "Please Enter Code";
  } else if (!codePattern.test(codeValue)) {
    err1.style.display = "block";
    err1.innerHTML = "Invalid Code, eg: (#ASD456)";
  } else {
    err1.style.display = "none";
    err1.innerHTML = "";
  }
}

function startDateValidate() {
  const startDateValue = document.getElementById("startDate").value;
  const startDatePattern = /^\d{4}-\d{2}-\d{2}$/;
  const err2 = document.getElementById("err2");

  if (startDateValue.trim() === "") {
    err2.style.display = "block";
    err2.innerHTML = "Please Enter The Start Date";
  } else if (!startDatePattern.test(startDateValue)) {
    err2.style.display = "block";
    err2.innerHTML = "Please Enter Valid Date, eg: (YYYY-MM-DD)";
  } else {
    err2.style.display = "none";
    err2.innerHTML = "";
  }
}

function endDateValidate() {
  const endDateValue = document.getElementById("endDate").value;
  const err3 = document.getElementById("err3");
  const startDateValue = document.getElementById("startDate").value;

  if (endDateValue.trim() === "") {
    err3.style.display = "block";
    err3.innerHTML = "Please Enter The End Date";
  } else if (new Date(startDateValue) > new Date(endDateValue)) {
    err3.style.display = "block";
    err3.innerHTML = "End date should be after start date";
  } else {
    err3.style.display = "none";
    err3.innerHTML = "";
  }
}

function discountValidate() {
  const discountValue = document.getElementById("discountPercentage").value;
  const discountPattern = /^(?:100|[1-9]?\d)%?$/;
  const err4 = document.getElementById("err4");

  if (discountValue.trim() === "") {
    err4.style.display = "block";
    err4.innerHTML = "Please Enter Discount %";
  } else if (!discountPattern.test(discountValue)) {
    err4.style.display = "block";
    err4.innerHTML = "Only Allowed Numbers & %";
  } else {
    err4.style.display = "none";
    err4.innerHTML = "";
  }
}

function minOrderValidate() {
  const minOrderValue = document.getElementById("minOrderValue").value;
  const minOrderPattern = /^-?\d+$/;
  const err5 = document.getElementById("err5");

  if (minOrderValue.trim() === "") {
    err5.style.display = "block";
    err5.innerHTML = "Please Enter Min Order Value";
  } else if (!minOrderPattern.test(minOrderValue)) {
    err5.style.display = "block";
    err5.innerHTML = "Only Allowed Numbers";
  } else {
    err5.style.display = "none";
    err5.innerHTML = "";
  }
}

function maxDiscountValidate() {
  const maxDiscountValue = document.getElementById("maxDiscount").value;
  const maxDiscountPattern = /^-?\d+$/;
  const err6 = document.getElementById("err6");

  if (maxDiscountValue.trim() === "") {
    err6.style.display = "block";
    err6.innerHTML = "Please Enter Max Discount";
  } else if (!maxDiscountPattern.test(maxDiscountValue)) {
    err6.style.display = "block";
    err6.innerHTML = "Only Allowed Numbers";
  } else {
    err6.style.display = "none";
    err6.innerHTML = "";
  }
}

function descriptionValidate() {
  const descriptionValue = document.getElementById("couponDescription").value;
  const descriptionPattern = /^[a-zA-Z0-9@#\-_?$%&]+$/;
  const err7 = document.getElementById("err7");

  if (descriptionValue.trim() === "") {
    err7.style.display = "block";
    err7.innerHTML = "Please Enter Description";
  } else if (!descriptionPattern.test(descriptionValue)) {
    err7.style.display = "block";
    err7.innerHTML = "Invalid Description";
  } else {
    err7.style.display = "none";
    err7.innerHTML = "";
  }
}

function usageLimitValidate() {
  const usageLimitValue = document.getElementById("usageLimit").value;
  const usageLimitPattern = /^-?\d+$/;
  const err8 = document.getElementById("err8");

  if (usageLimitValue.trim() === "") {
    err8.style.display = "block";
    err8.innerHTML = "Please Enter Usage Limit";
  } else if (!usageLimitPattern.test(usageLimitValue)) {
    err8.style.display = "block";
    err8.innerHTML = "Only Allowed Numbers";
  } else {
    err8.style.display = "none";
    err8.innerHTML = "";
  }
}

function addCoupon(event) {
  event.preventDefault();

  codeValidate();
  startDateValidate();
  endDateValidate();
  discountValidate();
  minOrderValidate();
  maxDiscountValidate();
  descriptionValidate();
  usageLimitValidate();

  const err1 = document.getElementById("err1");
  const err2 = document.getElementById("err2");
  const err3 = document.getElementById("err3");
  const err4 = document.getElementById("err4");
  const err5 = document.getElementById("err5");
  const err6 = document.getElementById("err6");
  const err7 = document.getElementById("err7");
  const err8 = document.getElementById("err8");

  if (err1.innerHTML || err2.innerHTML || err3.innerHTML || err4.innerHTML || err5.innerHTML || err6.innerHTML || err7.innerHTML || err8.innerHTML) {
    return false;
  }

  const code = document.getElementById("couponCode").value;
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  const discountPercentage = document.getElementById("discountPercentage").value;
  const minOrderValue = document.getElementById("minOrderValue").value;
  const maxDiscount = document.getElementById("maxDiscount").value;
  const description = document.getElementById("couponDescription").value;
  const usageLimit = document.getElementById("usageLimit").value;

  fetch("/admin/add-coupen", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ code, startDate, endDate, discountPercentage, minOrderValue, maxDiscount, description, usageLimit })
  })
    .then((response) => response.json())
    .then((response) => {
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Coupon Successfully Added",
          text: response.message,
          showCancelButton: false,
          showConfirmButton: false,
          timer: 1500,
        }).then(() => {
          window.location.href = "/admin/coupen";
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Coupon Failed to Add",
          text: response.message,
          showCancelButton: false,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
}