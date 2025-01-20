document.getElementById('newPasswordForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        Swal.fire({
            icon: 'error',
            title: 'Passwords do not match',
            text: 'Please ensure both passwords match.'
        });
        return;
    }

    try {
        const response = await fetch('/user/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ newPassword })
        });

        const result = await response.json();
        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: 'Password Reset Successful',
                text: result.message,
                timer: 1500,
                showConfirmButton: false,
            }).then(() => {
                window.location.href = '/user/login'; // Redirect to login page
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Failed to Reset Password',
                text: result.message,
            });
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An unexpected error occurred. Please try again.',
        });
    }
});