const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const cors = require('cors');

const app = express();
const db = new sqlite3.Database("./database.db");

app.use(cors({
    origin: 'http://localhost:5007',
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json()); 
app.use(express.static("public"));

function handleError(res, error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
}


// Registracijos maršrutas
app.post("/register", (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
  }
  

  db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });

      if (row) {
          return res.status(400).json({ message: "Username already exists" });
      }

      bcrypt.hash(password, 10, (err, hashedPassword) => {
          if (err) return res.status(500).json({ error: err.message });

          db.run("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", [username, email, hashedPassword], function (err) {
              if (err) {
                  return res.status(500).json({ error: err.message });
              }

              res.status(201).json({ message: "User registered successfully" });
          });
      });
  });
});

// Prisijungimo API maršrutas
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (err) return handleError(res, err);

        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid username or password" });
        }

        bcrypt.compare(password, user.password, (err, result) => {
            if (err) return handleError(res, err);

            if (result) {
                res.json({ success: true, message: "Login successful" });
            } else {
                res.status(401).json({ success: false, message: "Invalid username or password" });
            }
        });
    });
});

// Maršrutas įrašų gavimui pagal mėnesį ir metus
app.get("/get-entries", (req, res) => {
    const { month, year } = req.query;
    let query = "SELECT * FROM entries";
    let params = [];

    if (month && year) {
        query += " WHERE strftime('%m', date) = ? AND strftime('%Y', date) = ?";
        params = [month, year];
    } else if (month) {
        query += " WHERE strftime('%m', date) = ?";
        params = [month];
    } else if (year) {
        query += " WHERE strftime('%Y', date) = ?";
        params = [year];
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Internal server error" });
        }

        console.log("Fetched entries:", rows);
        res.json(rows || []);
    });
});

// Maršrutas naujo įrašo pridėjimui
app.post("/add-entry", (req, res) => {
    console.log('Add entry route hit');
    const { type, date, amount } = req.body;

    console.log("Received entry:", { type, date, amount });

    db.run("INSERT INTO entries (type, date, amount) VALUES (?, ?, ?)", 
        [type, date, amount], 
        function (err) {
            if (err) {
                console.error("Error inserting data:", err.message); 
                return res.status(500).json({ error: err.message });
            }

            console.log("Entry added with ID:", this.lastID); 
            res.json({ message: "Entry added", id: this.lastID });
        }
    );
});

// Maršrutas įrašui ištrinti
app.delete("/delete-entry/:id", (req, res) => {
    db.run("DELETE FROM entries WHERE id = ?", req.params.id, function (err) {
        if (err) return handleError(res, err);
        res.json({ message: "Entry deleted" });
    });
});


// Pavyzdinis el. pašto nustatymas naudojant nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL, // Naudokite aplinkos kintamuosius
        pass: process.env.EMAIL_PASSWORD // Naudokite aplinkos kintamuosius
    }
});

app.listen(5007, () => {
  console.log('Server is running on http://localhost:5007');
});

// // Slaptažodžio atstatymo užklausa
// app.post('/forgot-password', (req, res) => {
//     const { email } = req.body;

//     db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
//         if (err) return handleError(res, err);

//         if (!user) {
//             return res.status(404).json({ success: false, message: 'No account with that email found' });
//         }

//         const resetToken = Math.random().toString(36).substring(2, 15);

//         const mailOptions = {
//             from: process.env.EMAIL,
//             to: email,
//             subject: 'Password Reset Request',
//             text: `Click on the following link to reset your password: http://localhost:5006/reset-password?token=${resetToken}`
//         };

//         transporter.sendMail(mailOptions, (error, info) => {
//             if (error) {
//                 return res.status(500).json({ success: false, message: 'Failed to send email' });
//             }
//             res.json({ success: true, message: 'Password reset instructions have been sent to your email.' });
//         });
//     });
// });

