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
        console.log("Server response:", data);  // Atspausdins serverio atsakymą
        if (data.success) {
            alert("Registration successful!");
            window.location.href = "login.html";  // Nukreips į prisijungimo puslapį
        } else {
            alert("Error: " + data.message);  // Pateiks klaidos pranešimą, jei registracija nepavyks
        }
    })
    .catch((error) => {
        console.error("Error:", error);  // Atspausdins klaidas, jei užklausa nepavyks
    });
}

// Registracijos formos pateikimas
document.getElementById("register-form").addEventListener("submit", function(e) {
    e.preventDefault();  // Neleidžia formos išsiųsti automatiškai
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const email = document.getElementById("email").value;
    
    // Patikriname, ar visi laukeliai yra užpildyti
    if (!username || !password || !email) {
        alert("Please fill in all fields.");
        return;
    }
    
    // Išsiunčiame registracijos užklausą
    registerUser(username, password, email);
});