function sendPasswordResetRequest(email) {
    fetch("/forgot-password", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
    })
    .then((response) => response.json())
    .then((data) => {
        if (data.success) {
            alert("Password reset instructions have been sent to your email.");
        } else {
            alert("Error: " + data.message);
        }
    })
    .catch((error) => {
        console.error("Error:", error);
    });
}

document.getElementById("forgot-password-form").addEventListener("submit", function(e) {
    e.preventDefault();
    const email = document.getElementById("forgot-email").value;
    sendPasswordResetRequest(email);
});