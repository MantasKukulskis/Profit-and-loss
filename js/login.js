function loginUser(username, password) {
    fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
    })
    .then((response) => response.json())
    .then((data) => {
        if (data.success) {
            alert("Login successful!");
            window.location.href = "dashboard.html"; 
        } else {
            alert("Invalid username or password");
        }
    })
    .catch((error) => {
        console.error("Error:", error);
    });
}

document.getElementById("login-form").addEventListener("submit", function(e) {
    e.preventDefault();
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;
    loginUser(username, password);
});