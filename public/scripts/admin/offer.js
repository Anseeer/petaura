
function addProductOffer(event) {
    event.preventDefault();
    const productId = document.getElementById("product").value;
    const productOff = document.getElementById("offer").value;

    console.log(productId, offer)

    fetch("/admin/add-product-offer", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId, productOff })
    })
        .then((response) => response.json())
        .then((response) => {
            if (response.success) {
                Swal.fire({
                    icon: "success",
                    title: "Successfully Add Product Offer",
                    text: response.message,
                    showConfirmButton: false,
                    showCancelButton: false,
                    timer: 1500
                })
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Faild To Add Product Offer",
                    text: response.message,
                    showConfirmButton: false,
                    showCancelButton: false,
                    timer: 1500
                })
            }
        })
        .catch((err) => {
            Swal.fire({
                icon: "error",
                title: "Error In Add Product Offer",
                text: response.message,
                showConfirmButton: false,
                showCancelButton: false,
                timer: 1500
            })
        })
}