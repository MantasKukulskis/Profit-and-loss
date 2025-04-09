function loginUser(username, password) {
    fetch("http://localhost:4009/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            localStorage.setItem("user", JSON.stringify({ username }));

            alert("Login successful!");
            window.location.href = "services.html";
        } else {
            alert("Incorrect username or password");
        }
    })
    .catch(error => {
        console.error("Error logging in:", error);
        alert("Failed to connect! Check your console for details");
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("login-form");

    if (!form) {
        console.error("Error: login-form element not found!");
        return;
    }

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const usernameInput = document.querySelector("input[name='username']");
        const passwordInput = document.querySelector("input[name='password']");

        if (!usernameInput || !passwordInput) {
            console.error("Error: Missing input fields!");
            return;
        }

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            alert("Please fill in all fields");
            return;
        }

        loginUser(username, password);
    });

    const loginBtn = document.getElementById("login-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const user = localStorage.getItem("user");

    if (user) {
        if (loginBtn) loginBtn.style.display = "none";
        if (logoutBtn) logoutBtn.style.display = "inline-block";
    } else {
        if (loginBtn) loginBtn.style.display = "inline-block";
        if (logoutBtn) logoutBtn.style.display = "none";
    }
});