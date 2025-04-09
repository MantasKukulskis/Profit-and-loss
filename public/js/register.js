function registerUser(username, password, email) {
    fetch("http://localhost:4009/register", { 
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, email }),  
    })
    .then((response) => response.json())  
    .then((data) => {
        console.log("Server response:", data); 

        if (data.success) {
            alert("Registration successful!"); 
            window.location.href = "login.html"; 
        } else {
            alert("Error: " + data.message); 
        }
    })
    .catch((error) => {
        console.error("Error:", error); 
        alert("Registration failed! Please try again");
    });
}


document.getElementById("register-form").addEventListener("submit", function(e) {
    e.preventDefault();  

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const email = document.getElementById("email").value;

    if (!username || !password || !email) {
        alert("Please fill in all fields");
        return;
    }

    if (!isValidEmail(email)) {
        alert("Please enter a valid email address");
        return;
    }

    if (!isStrongPassword(password)) {
        alert("Password must be at least 6 characters long");
        return;
    }

    registerUser(username, password, email);
});


function isValidEmail(email) {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailPattern.test(email);
}


function isStrongPassword(password) {
    return password.length >= 6;  
}