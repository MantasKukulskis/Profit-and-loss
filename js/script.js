document.addEventListener("DOMContentLoaded", function () {
    
    const incomeForm = document.querySelector(".income-form");
    const outcomeForm = document.querySelector(".outcome-form");

    function validateAmount(inputField, errorMessage) {
        let amount = parseFloat(inputField.value);
        if (amount > 1000) {
            errorMessage.style.display = "inline";
            inputField.value = 1000; 
        } else {
            errorMessage.style.display = "none";
        }
    }

    function validateAmount(inputField, errorMessage) {
        let amount = parseFloat(inputField.value);
        if (amount > 1000) {
            errorMessage.style.display = "inline";
            inputField.value = 1000; 
        } else {
            errorMessage.style.display = "none";
        }
    }

    incomeForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const amountInput = document.getElementById("income-amount");
        const errorMessage = document.getElementById("income-error-message");
        validateAmount(amountInput, errorMessage);
        alert("✅ Profit recorded: €" + amountInput.value);
    });

    outcomeForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const amountInput = document.getElementById("outcome-amount");
        const errorMessage = document.getElementById("outcome-error-message");
        validateAmount(amountInput, errorMessage);
        alert("❌ Loss recorded: €" + amountInput.value);
    });
});

console.log("✅ JavaScript file is connected and working!");