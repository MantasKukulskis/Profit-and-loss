document.addEventListener("DOMContentLoaded", function () {
  
    const modal = document.getElementById("modal");
    const openModalBtn = document.getElementById("open-modal");
    const closeModalBtn = document.querySelector(".close");
    const addEntryBtn = document.getElementById("add-entry");
  
    const entryTypeEl = document.getElementById("entry-type");
    const entryDateEl = document.getElementById("entry-date");
    const entryAmountEl = document.getElementById("entry-amount");
    
    const entryList = document.getElementById("entry-list");
    const totalIncomeEl = document.getElementById("total-income");
    const totalOutcomeEl = document.getElementById("total-outcome");
    const netBalanceEl = document.getElementById("net-balance");
  
    let totalIncome = 0;
    let totalOutcome = 0;
  
    function updateDisplay() {
      totalIncomeEl.textContent = `€${totalIncome.toFixed(2)}`;
      totalOutcomeEl.textContent = `€${totalOutcome.toFixed(2)}`;
      netBalanceEl.textContent = `€${(totalIncome - totalOutcome).toFixed(2)}`;
    }
  
    openModalBtn.addEventListener("click", function () {
      modal.style.display = "block";
    });
  
    closeModalBtn.addEventListener("click", function () {
      modal.style.display = "none";
    });
  
    window.addEventListener("click", function (event) {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    });
  
    addEntryBtn.addEventListener("click", function () {
      const type = entryTypeEl.value;
      const date = entryDateEl.value;
      const amount = parseFloat(entryAmountEl.value);
  
      if (!date) {
        alert("Please select a date.");
        return;
      }
      if (isNaN(amount) || amount <= 0 || amount > 1000) {
        alert("Please enter a valid amount between 1 and 1000€.");
        return;
      }
  
      const newRow = document.createElement("tr");
      newRow.innerHTML = `
        <td>${date}</td>
        <td>${type === "profit" ? "✅ Profit" : "❌ Loss"}</td>
        <td>€${amount.toFixed(2)}</td>
      `;
      entryList.appendChild(newRow);
  
      if (type === "profit") {
        totalIncome += amount;
      } else {
        totalOutcome += amount;
      }
      updateDisplay();
  
      entryDateEl.value = "";
      entryAmountEl.value = "";
      modal.style.display = "none";
    });
  });