document.getElementById("forgot-password-form").addEventListener("submit", function(e) {
    e.preventDefault();

    const email = document.getElementById("email").value;

    fetch("http://localhost:4009/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
    })
    .catch(error => {
        console.error("Error:", error);
    });
});