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
            throw new Error(`HTTP klaida! Statusas: ${response.status}`);
        }
        return response.json(); 
    })
    .then(data => {
        if (data.success) {
            alert("Prisijungimas sėkmingas!");
            window.location.href = "dashboard.html"; 
        } else {
            alert("Neteisingas vartotojo vardas arba slaptažodis");
        }
    })
    .catch(error => {
        console.error("Klaida prisijungiant:", error);
        alert("Nepavyko prisijungti! Patikrinkite konsolę dėl detalių.");
    });
}

document.addEventListener("DOMContentLoaded", function() { 
    const form = document.getElementById("login-form");
    
    if (!form) {
        console.error("Klaida: nerastas login-form elementas!");
        return;
    }

    form.addEventListener("submit", function(e) {
        e.preventDefault();
        
        const usernameInput = document.querySelector("input[name='username']");
        const passwordInput = document.querySelector("input[name='password']");
        
        if (!usernameInput || !passwordInput) {
            console.error("Klaida: trūksta įvesties laukelių!");
            return;
        }

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            alert("Prašome įvesti visus laukelius!");
            return;
        }

        loginUser(username, password);
    });
});