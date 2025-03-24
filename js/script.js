document.addEventListener("DOMContentLoaded", function () {
  console.log("✅ script.js loaded.");
  
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
  const netBalanceEl = document.getElementById("net-balance");
  const monthlyBalanceEl = document.getElementById("monthly-balance");
  
  // Filter Elements
  const monthFilterEl = document.getElementById("month-filter");
  const yearFilterEl = document.getElementById("year-filter");
  const applyFilterBtn = document.getElementById("apply-filter");
  
  // Array to store all entries
  let allEntries = [];
  
  // Function to update table and overall balance (net balance from all entries)
  function updateDisplay() {
    // Clear table
    entryList.innerHTML = "";
    let total = 0;
    allEntries.forEach(entry => {
      total += (entry.type === "profit" ? entry.amount : -entry.amount);
      const newRow = document.createElement("tr");
      newRow.dataset.date = entry.date; // storing date for filtering
      newRow.dataset.type = entry.type;
      newRow.dataset.amount = entry.amount;
      newRow.innerHTML = `
        <td>${entry.date}</td>
        <td>${entry.type === "profit" ? "✅ Profit" : "❌ Loss"}</td>
        <td>€${entry.amount.toFixed(2)}</td>
        <td><button class="delete-entry">Delete</button></td>
      `;
      // Add delete event listener
      newRow.querySelector(".delete-entry").addEventListener("click", function () {
        removeEntry(entry);
      });
      entryList.appendChild(newRow);
    });
    netBalanceEl.textContent = `€${total.toFixed(2)}`;
  }
  
  // Function to update monthly balance based on filter
  function updateMonthlyBalance(filteredEntries) {
    let monthlyTotal = 0;
    filteredEntries.forEach(entry => {
      monthlyTotal += (entry.type === "profit" ? entry.amount : -entry.amount);
    });
    monthlyBalanceEl.textContent = `€${monthlyTotal.toFixed(2)}`;
  }
  
  // Function to remove an entry
  function removeEntry(entryToRemove) {
    // Remove from array
    allEntries = allEntries.filter(entry => entry !== entryToRemove);
    updateDisplay();
    applyFilter(); // reapply filter to update monthly balance
  }
  
  // Open modal
  openModalBtn.addEventListener("click", function () {
    modal.style.display = "block";
  });
  
  // Close modal
  closeModalBtn.addEventListener("click", function () {
    modal.style.display = "none";
  });
  
  // Close modal when clicking outside modal-content
  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
  
  // Add new entry
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
    
    const newEntry = { type, date, amount };
    allEntries.push(newEntry);
    updateDisplay();
    applyFilter(); // reapply filter to update monthly balance
    
    // Clear modal inputs and close modal
    entryDateEl.value = "";
    entryAmountEl.value = "";
    modal.style.display = "none";
  });
  
  // Filter function
  function applyFilter() {
    const selectedMonth = parseInt(monthFilterEl.value); // may be NaN if empty
    const selectedYear = parseInt(yearFilterEl.value);
    let filteredEntries = allEntries;
    
    if (!isNaN(selectedMonth)) {
      filteredEntries = filteredEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getMonth() + 1 === selectedMonth;
      });
    }
    if (!isNaN(selectedYear)) {
      filteredEntries = filteredEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getFullYear() === selectedYear;
      });
    }
    updateMonthlyBalance(filteredEntries);
  }
  
  // Apply filter when button is clicked
  applyFilterBtn.addEventListener("click", function () {
    applyFilter();
  });
  
  // Optional: update monthly balance when filter selection changes
  monthFilterEl.addEventListener("change", applyFilter);
  yearFilterEl.addEventListener("change", applyFilter);
});