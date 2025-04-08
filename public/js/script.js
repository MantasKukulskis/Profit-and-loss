document.addEventListener("DOMContentLoaded", function () {
  console.log("✅ script.js loaded.");

  const modal = document.getElementById("modal");
  const openModalBtn = document.getElementById("open-modal");
  const closeModalBtn = document.querySelector(".close");
  const addEntryBtn = document.getElementById("add-entry");

  const entryTypeEl = document.getElementById("entry-type");
  const entryDateEl = document.getElementById("entry-date");
  const entryAmountEl = document.getElementById("entry-amount");

  const entryList = document.getElementById("entry-list");
  const netBalanceEl = document.getElementById("net-balance");
  const monthlyBalanceEl = document.getElementById("monthly-balance");

  const monthFilterEl = document.getElementById("month-filter");
  const yearFilterEl = document.getElementById("year-filter");
  const applyFilterBtn = document.getElementById("apply-filter");

  let allEntries = [];

  function fetchEntries() {
    fetch("http://localhost:4009/get-entries")
      .then(response => response.json())
      .then(data => {
        allEntries = data;
        updateDisplay(allEntries);
        applyFilter();
      })
      .catch(error => console.error('Error fetching entries:', error));
  }

  fetchEntries();

  function updateDisplay(filteredEntries) {
    entryList.innerHTML = "";
    let total = 0;

    filteredEntries.forEach(entry => {
      total += (entry.type === "profit" ? entry.amount : -entry.amount);
      const newRow = document.createElement("tr");
      newRow.dataset.date = entry.date;
      newRow.dataset.type = entry.type;
      newRow.dataset.amount = entry.amount;
      newRow.innerHTML = `
        <td>${entry.date}</td>
        <td>${entry.type === "profit" ? "✅ Profit" : "❌ Loss"}</td>
        <td>€${entry.amount.toFixed(2)}</td>
        <td>
          <button class="delete-entry">Delete</button>
          <button class="edit-entry">Edit</button>
        </td>
      `;

      newRow.querySelector(".delete-entry").addEventListener("click", function () {
        removeEntry(entry);
      });

      newRow.querySelector(".edit-entry").addEventListener("click", function () {
        editEntry(entry);
      });

      entryList.appendChild(newRow);
    });

    netBalanceEl.textContent = `€${total.toFixed(2)}`;
  }

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

  function removeEntry(entryToRemove) {
    allEntries = allEntries.filter(entry => entry !== entryToRemove);
    updateDisplay(allEntries);
    applyFilter();

    fetch(`http://localhost:4009/delete-entry/${entryToRemove.id}`, {
      method: "DELETE"
    })
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error('Error deleting entry:', error));
  }

  function editEntry(entryToEdit) {
    const newType = prompt("Įveskite tipą (profit/loss):", entryToEdit.type);
    const newDate = prompt("Įveskite datą (YYYY-MM-DD):", entryToEdit.date);
    const newAmount = parseFloat(prompt("Įveskite sumą:", entryToEdit.amount));
  
    if (!['profit', 'loss'].includes(newType)) {
      alert("Tipas turi būti 'profit' arba 'loss'");
      return;
    }
    if (!newDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      alert("Data turi būti formatu YYYY-MM-DD");
      return;
    }
    if (isNaN(newAmount) || newAmount <= 0 || newAmount > 1000) {
      alert("Įveskite skaičių tarp 1 ir 1000");
      return;
    }
  
    console.log("Redaguojamas įrašas su ID:", entryToEdit.id);
  
    fetch(`http://localhost:4009/update-entry/${entryToEdit.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        type: newType,
        date: newDate,
        amount: newAmount
      })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Serveris grąžino klaidą");
        }
        return response.json();
      })
      .then(data => {
        console.log("Atnaujinta:", data);
        
        entryToEdit.type = newType;
        entryToEdit.date = newDate;
        entryToEdit.amount = newAmount;
        updateDisplay(allEntries);
        applyFilter();
      })
      .catch(error => {
        console.error("Klaida redaguojant:", error);
        alert("Nepavyko atnaujinti įrašo.");
      });
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

    const newEntry = { type, date, amount };

    fetch("http://localhost:4009/add-entry", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newEntry)
    })
      .then(response => response.json())
      .then(data => {
        allEntries.push({ ...newEntry, id: data.id });
        updateDisplay(allEntries);
        applyFilter();
      })
      .catch(error => console.error('Error adding entry:', error));

    entryDateEl.value = "";
    entryAmountEl.value = "";
    modal.style.display = "none";
  });

  function applyFilter() {
    const selectedMonth = parseInt(monthFilterEl.value);
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
    updateDisplay(filteredEntries);
  }

  applyFilterBtn.addEventListener("click", function () {
    applyFilter();
  });

  monthFilterEl.addEventListener("change", applyFilter);
  yearFilterEl.addEventListener("change", applyFilter);
});