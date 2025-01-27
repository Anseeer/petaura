function addToCart(itemId) {
    fetch(`/add-to-cart?productId=${itemId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then((response)=> response.json())
    .then(response => {
        if (response.success) {
            Swal.fire({
                icon:"success",
                title:"Added",
                showCancelButton:false,
                showConfirmButton:false,
                timer:1200
            })
        } else {
            alert('Failed to add item to cart. Please try again.');
        }
    })
    .catch(err => console.error(err));

    return false;
}