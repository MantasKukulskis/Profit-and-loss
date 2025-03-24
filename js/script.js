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

  // Function to get all entries from server
  function fetchEntries() {
    fetch("http://localhost:5000/get-entries")
      .then(response => response.json())
      .then(data => {
        allEntries = data;
        updateDisplay(allEntries); // Update table when data is fetched
        applyFilter(); // Apply filter after loading data
      })
      .catch(error => console.error('Error fetching entries:', error));
  }

  // Call fetchEntries on page load to populate the entries
  fetchEntries();

  // Function to update table and overall balance (net balance from all entries)
  function updateDisplay(filteredEntries) {
    entryList.innerHTML = ""; // Clear table
    let total = 0;

    filteredEntries.forEach(entry => {
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

    // Update net balance
    netBalanceEl.textContent = `€${total.toFixed(2)}`;
  }

  // Function to update monthly balance based on filter
  function updateMonthlyBalance(filteredEntries) {
    let profitTotal = 0;
    let lossTotal = 0;

    filteredEntries.forEach(entry => {
      if (entry.type === "profit") {
        profitTotal += entry.amount;
      } else {
        lossTotal += entry.amount;
      }
    });

    const netTotal = profitTotal - lossTotal;
    monthlyBalanceEl.textContent = `Profit: €${profitTotal.toFixed(2)} | Loss: €${lossTotal.toFixed(2)} | Net Balance: €${netTotal.toFixed(2)}`;
  }

  // Function to remove an entry
  function removeEntry(entryToRemove) {
    // Remove from array
    allEntries = allEntries.filter(entry => entry !== entryToRemove);
    updateDisplay(allEntries);
    applyFilter(); // reapply filter to update monthly balance

    // Delete entry from server
    fetch(`http://localhost:5000/delete-entry/${entryToRemove.id}`, {
      method: "DELETE"
    })
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error('Error deleting entry:', error));
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

    // Send new entry to server
    fetch("http://localhost:5000/add-entry", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newEntry)
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        allEntries.push({ ...newEntry, id: data.id }); // Add new entry to the array with server-assigned ID
        updateDisplay(allEntries);
        applyFilter(); // reapply filter to update monthly balance
      })
      .catch(error => console.error('Error adding entry:', error));

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

    // Filter by month
    if (!isNaN(selectedMonth)) {
      filteredEntries = filteredEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getMonth() + 1 === selectedMonth;
      });
    }

    // Filter by year
    if (!isNaN(selectedYear)) {
      filteredEntries = filteredEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getFullYear() === selectedYear;
      });
    }

    // Update monthly balance based on filtered entries
    updateMonthlyBalance(filteredEntries);
    updateDisplay(filteredEntries); // Update table with filtered entries
  }

  // Apply filter when button is clicked
  applyFilterBtn.addEventListener("click", function () {
    applyFilter(); // Filter based on selected values
  });

  // Optional: update monthly balance when filter selection changes
  monthFilterEl.addEventListener("change", applyFilter);
  yearFilterEl.addEventListener("change", applyFilter);
});