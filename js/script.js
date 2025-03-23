console.log("✅ JavaScript is connected to services.html!");

// Wait until the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
    const incomeForm = document.querySelector(".income-form");
    const outcomeForm = document.querySelector(".outcome-form");

    const totalIncomeEl = document.getElementById("total-income");
    const totalOutcomeEl = document.getElementById("total-outcome");
    const netBalanceEl = document.getElementById("net-balance");

    const incomeList = document.getElementById("income-list");
    const outcomeList = document.getElementById("outcome-list");

    let totalIncome = 0;
    let totalOutcome = 0;

    // Function to update the total amounts on the page
    function updateDisplay() {
        totalIncomeEl.textContent = `€${totalIncome.toFixed(2)}`;
        totalOutcomeEl.textContent = `€${totalOutcome.toFixed(2)}`;
        netBalanceEl.textContent = `€${(totalIncome - totalOutcome).toFixed(2)}`;
    }

    // Validate the input amount
    function validateAmount(inputField, errorMessage) {
        let amount = parseFloat(inputField.value);

        if (isNaN(amount) || amount <= 0) {
            errorMessage.textContent = "Enter a valid positive number!";
            errorMessage.style.display = "inline";
            inputField.value = "";
            return false;
        } else if (amount > 1000) {
            errorMessage.textContent = "Maximum allowed amount is €1000!";
            errorMessage.style.display = "inline";
            inputField.value = 1000;
            return false;
        } else {
            errorMessage.style.display = "none";
            return true;
        }
    }

    // Handle the income form submission
    if (incomeForm) {
        incomeForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const amountInput = document.getElementById("income-amount");
            const dateInput = document.getElementById("income-date");
            const errorMessage = document.getElementById("income-error-message");

            if (validateAmount(amountInput, errorMessage)) {
                const amount = parseFloat(amountInput.value);
                const date = dateInput.value;

                // Update total income
                totalIncome += amount;
                updateDisplay();

                // Add to the income list
                const listItem = document.createElement("li");
                listItem.textContent = `Date: ${date}, Profit: €${amount.toFixed(2)}`;
                incomeList.appendChild(listItem);

                // Reset form inputs
                amountInput.value = "";
                dateInput.value = "";
            }
        });
    }

    // Handle the outcome form submission
    if (outcomeForm) {
        outcomeForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const amountInput = document.getElementById("outcome-amount");
            const dateInput = document.getElementById("outcome-date");
            const errorMessage = document.getElementById("outcome-error-message");

            if (validateAmount(amountInput, errorMessage)) {
                const amount = parseFloat(amountInput.value);
                const date = dateInput.value;

                // Update total outcome
                totalOutcome += amount;
                updateDisplay();

                // Add to the outcome list
                const listItem = document.createElement("li");
                listItem.textContent = `Date: ${date}, Loss: €${amount.toFixed(2)}`;
                outcomeList.appendChild(listItem);

                // Reset form inputs
                amountInput.value = "";
                dateInput.value = "";
            }
        });
    }
});