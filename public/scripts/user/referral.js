function copyReferralCode() {
    const referralCode = document.getElementById("referralCode").innerText;
    navigator.clipboard.writeText(referralCode).then(() => {
        Swal.fire({
            icon:"success",
            title:"Copied",
            showCancelButton:false,
            showConfirmButton:false,
            timer:1200
        })
    }).catch(err => {
        console.error("Failed to copy referral code: ", err);
    });
}