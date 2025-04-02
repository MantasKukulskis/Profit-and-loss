document.getElementById("reset-password-form").addEventListener("submit", function(e) {
    e.preventDefault();

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const newPassword = document.getElementById("new-password").value;

    fetch("http://localhost:4009/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        if (data.success) window.location.href = "login.html";
    })
    .catch(error => console.error("Error:", error));
});