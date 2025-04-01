document.getElementById("logout-btn").addEventListener("click", function() {
    localStorage.removeItem("user"); 

    alert("Successfully logged out!");
    window.location.href = "login.html"; 
});