const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const app = express();
const db = new sqlite3.Database("./database.db");

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// Registracijos maršrutas
app.post("/register", (req, res) => {
    const { username, email, password } = req.body;

    // Patikriname, ar visi laukeliai užpildyti
    if (!username || !email || !password) {
        return res.status(400).json({ message: "Please fill all fields" });
    }

    // Patikriname, ar vartotojo vardas jau egzistuoja
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });

        if (row) {
            return res.status(400).json({ message: "Username already exists" });
        }

        // Slaptažodžio šifravimas
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) return res.status(500).json({ error: err.message });

            // Įrašome vartotoją į duomenų bazę
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
        if (err) return res.status(500).json({ error: err.message });

        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid username or password" });
        }

        // Palyginame šifruotą slaptažodį
        bcrypt.compare(password, user.password, (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

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
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Maršrutas naujo įrašo pridėjimui
app.post("/add-entry", (req, res) => {
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
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Entry deleted" });
    });
});

// Serverio klausymas
const PORT = 5006;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Pavyzdinis el. pašto nustatymas naudojant nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com', // Atitinkamai pakeiskite savo el. pašto adresą
        pass: 'your-email-password'    // Atitinkamai pakeiskite savo el. pašto slaptažodį arba naudokite Google App Password
    }
});

// Slaptažodžio atstatymo užklausa
app.post('/forgot-password', (req, res) => {
    const { email } = req.body;

    // Patikrinkite, ar el. paštas egzistuoja
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error' });

        if (!user) {
            return res.status(404).json({ success: false, message: 'No account with that email found' });
        }

        // Generuojame slaptažodžio atstatymo nuorodą
        const resetToken = Math.random().toString(36).substring(2, 15);  // Atsitiktinis tokenas

        // Siųskite atstatymo nuorodą el. paštu
        const mailOptions = {
            from: 'your-email@gmail.com',  // Atitinkamai pakeiskite savo el. pašto adresą
            to: email,
            subject: 'Password Reset Request',
            text: `Click on the following link to reset your password: http://localhost:5006/reset-password?token=${resetToken}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ success: false, message: 'Failed to send email' });
            }
            res.json({ success: true, message: 'Password reset instructions have been sent to your email.' });
        });
    });
});