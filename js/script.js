document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ script.js is loaded.");
  
    // Modal Elements
    const modal = document.getElementById("modal");
    const openModalBtn = document.getElementById("open-modal");
    const closeModalBtn = document.querySelector(".close");
    const addEntryBtn = document.getElementById("add-entry");
  
    // Form Elements inside modal
    const entryTypeEl = document.getElementById("entry-type");
    const entryDateEl = document.getElementById("entry-date");
    const entryAmountEl = document.getElementById("entry-amount");
    
    // Table and Totals Elements
    const entryList = document.getElementById("entry-list");
    const totalIncomeEl = document.getElementById("total-income");
    const totalOutcomeEl = document.getElementById("total-outcome");
    const netBalanceEl = document.getElementById("net-balance");
  
    let totalIncome = 0;
    let totalOutcome = 0;
  
    // Function to update totals
    function updateDisplay() {
      totalIncomeEl.textContent = `€${totalIncome.toFixed(2)}`;
      totalOutcomeEl.textContent = `€${totalOutcome.toFixed(2)}`;
      netBalanceEl.textContent = `€${(totalIncome - totalOutcome).toFixed(2)}`;
    }
  
    // Open modal
    openModalBtn.addEventListener("click", function () {
      modal.style.display = "block";
    });
  
    // Close modal when clicking the close button
    closeModalBtn.addEventListener("click", function () {
      modal.style.display = "none";
    });
  
    // Close modal when clicking outside modal content
    window.addEventListener("click", function (event) {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    });
  
    // Add new entry on button click
    addEntryBtn.addEventListener("click", function () {
      const type = entryTypeEl.value;
      const date = entryDateEl.value;
      const amount = parseFloat(entryAmountEl.value);
  
      // Validate inputs
      if (!date) {
        alert("Please select a date.");
        return;
      }
      if (isNaN(amount) || amount <= 0 || amount > 1000) {
        alert("Please enter a valid amount between 1 and 1000€.");
        return;
      }
  
      // Create a new table row
      const newRow = document.createElement("tr");
      newRow.innerHTML = `
        <td>${date}</td>
        <td>${type === "profit" ? "✅ Profit" : "❌ Loss"}</td>
        <td>€${amount.toFixed(2)}</td>
      `;
      entryList.appendChild(newRow);
  
      // Update totals
      if (type === "profit") {
        totalIncome += amount;
      } else {
        totalOutcome += amount;
      }
      updateDisplay();
  
      // Clear inputs and close modal
      entryDateEl.value = "";
      entryAmountEl.value = "";
      modal.style.display = "none";
    });
  });