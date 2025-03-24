const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const db = new sqlite3.Database("./database.db");

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public")); // Kad veiktų `services.html`



app.get("/get-entries", (req, res) => {
    const { month, year } = req.query;
  
    let query = "SELECT * FROM entries";
    let params = [];
  
    if (month && year) {
      // Filtruoti pagal mėnesį ir metus
      query += " WHERE strftime('%m', date) = ? AND strftime('%Y', date) = ?";
      params = [month, year];
    } else if (month) {
      // Filtruoti tik pagal mėnesį
      query += " WHERE strftime('%m', date) = ?";
      params = [month];
    } else if (year) {
      // Filtruoti tik pagal metus
      query += " WHERE strftime('%Y', date) = ?";
      params = [year];
    }
  
    db.all(query, params, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });

app.post("/add-entry", (req, res) => {
    const { type, date, amount } = req.body;

    // Patikrink, ar duomenys gauti iš kliento
    console.log("Received entry:", { type, date, amount });

    db.run("INSERT INTO entries (type, date, amount) VALUES (?, ?, ?)", 
        [type, date, amount], 
        function (err) {
            if (err) {
                console.error("Error inserting data:", err.message); // Spausdink klaidą
                return res.status(500).json({ error: err.message });
            }

            console.log("Entry added with ID:", this.lastID); // Patikrink, ar ID teisingai sugeneruotas
            res.json({ message: "Entry added", id: this.lastID });
        }
    );
});
// API: Ištrinti įrašą iš DB
app.delete("/delete-entry/:id", (req, res) => {
    db.run("DELETE FROM entries WHERE id = ?", req.params.id, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Entry deleted" });
    });
});

// Paleidžiame serverį
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});