function blockProduct(event, btn, id) {
    event.preventDefault();

    Swal.fire({
        title: "Are you sure?",
        text: "Do you want to block this product?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, block!",
    }).then((result) => {
        if (!result.isConfirmed) return;

        btn.disabled = true;

        fetch(`/admin/blockProduct?id=${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        icon: "success",
                        title: "Product Blocked!",
                        timer: 1200,
                        showConfirmButton: false,
                    });

                    btn.innerText = "Unblock";
                    btn.onclick = (e) => unblockProduct(e, btn, id);
                }
            })
            .catch(() => {
                Swal.fire("Error", "Something went wrong", "error");
            })
            .finally(() => {
                btn.disabled = false;
            });
    });
}

function unblockProduct(event, btn, id) {
    event.preventDefault();

    Swal.fire({
        title: "Are you sure?",
        text: "Do you want to unblock this product?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, unblock!",
    }).then((result) => {
        if (!result.isConfirmed) return;

        btn.disabled = true;

        fetch(`/admin/unblockProduct?id=${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        icon: "success",
                        title: "Product Unblocked!",
                        timer: 1200,
                        showConfirmButton: false,
                    });

                    btn.innerText = "Block";
                    btn.onclick = (e) => blockProduct(e, btn, id);
                }
            })
            .catch(() => {
                Swal.fire("Error", "Something went wrong", "error");
            })
            .finally(() => {
                btn.disabled = false;
            });
    });
}
