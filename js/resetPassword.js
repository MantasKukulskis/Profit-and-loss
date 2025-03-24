function resetPassword(token, newPassword) {
    fetch(`/reset-password/${token}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ newPassword }),
    })
    .then((response) => response.json())
    .then((data) => {
        if (data.success) {
            alert("Password reset successful");
            window.location.href = "login.html";  // Redirect to login page
        } else {
            alert("Error: " + data.message);
        }
    })
    .catch((error) => {
        console.error("Error:", error);
    });
}

// Slaptažodžio atstatymo formos pateikimas
document.getElementById("reset-password-form").addEventListener("submit", function(e) {
    e.preventDefault();
    const token = window.location.pathname.split("/").pop(); // Get token from URL
    const newPassword = document.getElementById("new-password").value;
    resetPassword(token, newPassword);
});