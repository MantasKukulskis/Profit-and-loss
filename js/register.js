function registerUser(username, password, email) {
    fetch("/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, email }),
    })
    .then((response) => response.json())
    .then((data) => {
        if (data.success) {
            alert("Registration successful!");
            window.location.href = "login.html";  // Redirect to login page
        } else {
            alert("Error: " + data.message);
        }
    })
    .catch((error) => {
        console.error("Error:", error);
    });
}

// Registracijos formos pateikimas
document.getElementById("register-form").addEventListener("submit", function(e) {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const email = document.getElementById("email").value;
    registerUser(username, password, email);
});