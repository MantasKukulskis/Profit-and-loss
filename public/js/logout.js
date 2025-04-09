document.addEventListener("DOMContentLoaded", function () {
    const logoutBtn = document.getElementById("logout-btn");
    const loginBtn = document.getElementById("login-btn");

    const user = localStorage.getItem("user");

    // Rodo arba slepia mygtukus priklausomai nuo prisijungimo būsenos
    if (user) {
        if (logoutBtn) logoutBtn.style.display = "inline-block";
        if (loginBtn) loginBtn.style.display = "none";
    } else {
        if (logoutBtn) logoutBtn.style.display = "none";
        if (loginBtn) loginBtn.style.display = "inline-block";
    }

    // Logout funkcionalumas
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            localStorage.removeItem("user");
            alert("Sėkmingai atsijungėte!");
            window.location.href = "login.html";
        });
    }
});