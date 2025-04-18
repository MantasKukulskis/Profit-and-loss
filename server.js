const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const cors = require('cors');
const crypto = require("crypto");
const util = require('util');
require("dotenv").config();


const bcryptAsync = util.promisify(bcrypt.hash);
const app = express();
const PORT = process.env.PORT || 4009;
const db = new sqlite3.Database("./database.db", (err) => {
    if (err) {
        console.error("❌ Error opening DB:", err.message);
    } else {
        console.log("✅ Connected to SQLite database.");

        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            resetToken TEXT,
            resetTokenExpiry INTEGER
        )`, (err) => {
            if (err) {
                console.error("❌ Error creating users table:", err.message);
            } else {
                console.log("✅ Users table created successfully with required columns");
            }
        });

        db.run(`CREATE TABLE IF NOT EXISTS entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            date TEXT NOT NULL,
            amount REAL NOT NULL
        )`, (err) => {
            if (err) {
                console.error("❌ Error creating entries table:", err.message);
            } else {
                console.log("✅ Entries table created successfully");
            }
        });
    }
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '8mantas8@gmail.com',
    pass: 'dttb pfem tzio scnw '
  }
});

app.use(cors({
    origin: 'http://localhost:5500',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json()); 

const path = require("path");

app.use(express.static(path.join(__dirname, 'public')));


function handleError(res, error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
}

app.get("/", (req, res) => {
    res.send("Backend works!");
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


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

app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Enter email" });
  }

  try {
    const user = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
        if (err) reject(err);
        resolve(user);
      });
    });

    if (!user) {
      console.error("❌ User not found with email:", email);
      return res.status(404).json({ message: "Email not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = Date.now() + 86400000; 

    await new Promise((resolve, reject) => {
      db.run("UPDATE users SET resetToken = ?, resetTokenExpiry = ? WHERE email = ?", 
        [resetToken, tokenExpiry, email], function(err) {
          if (err) reject(err);
          resolve();
        });
    });

    console.log("✅ Token updated successfully for email:", email); 
    const resetLink = `http://localhost:5500/public/html/reset-password.html?token=${resetToken}`;

    transporter.sendMail({
      to: email,
      subject: "Password reset",
      text: `Reset password: ${resetLink}`
    }, (err, info) => {
      if (err) {
        console.error("❌ Error sending email:", err);
        return res.status(500).json({ message: "Failed to send reset link!" });
      }

      console.log('✅ Email sent:', info.response);
      
      return res.status(200).json({ message: "Link sent. Check your email"});
    });

  } catch (err) {
    console.error("❌ Error in /forgot-password:", err);
    return res.status(500).json({ error: "Request could not be processed" });
  }
});

app.post("/reset-password", async (req, res) => {
    const { token, newPassword } = req.body;
  
    if (!token || !newPassword) {
        return res.status(400).json({ success: false, message: 'Token or new password missing' });
    }
  
    try {
        const user = await new Promise((resolve, reject) => {
            db.get("SELECT * FROM users WHERE resetToken = ? AND resetTokenExpiry > ?", [token, Date.now()], (err, user) => {
                if (err) reject(err);
                resolve(user);
            });
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Token is invalid or expired' });
        }

        const hashedPassword = await bcryptAsync(newPassword, 10);

    
        db.run("UPDATE users SET password = ?, resetToken = NULL, resetTokenExpiry = NULL WHERE id = ?", 
            [hashedPassword, user.id], function (err) {
                if (err) {
                    console.error("❌ Error updating password:", err);  
                    return res.status(500).json({ success: false, message: 'Error updating password' });
                }

                console.log(`✅ Slaptažodis atnaujintas vartotojui su ID: ${user.id}`);
                res.status(200).json({ success: true, message: 'Password successfully updated' });
            });
    } catch (err) {
        console.error("❌ Error in /reset-password:", err);
        return res.status(500).json({ success: false, message: 'Request could not be processed' });
    }
});

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

app.delete("/delete-entry/:id", (req, res) => {
    db.run("DELETE FROM entries WHERE id = ?", req.params.id, function (err) {
        if (err) return handleError(res, err);
        res.json({ message: "Entry deleted" });
    });
});

app.put("/update-entry/:id", (req, res) => {
    const { type, date, amount } = req.body;
    const id = req.params.id;

    if (!type || !date || !amount) {
        return res.status(400).json({ error: "Missing data for editing" });
    }

    db.run(
        "UPDATE entries SET type = ?, date = ?, amount = ? WHERE id = ?",
        [type, date, amount, id],
        function (err) {
            if (err) {
                console.error("❌ Error updating record:", err.message);
                return res.status(500).json({ error: err.message });
            }

            if (this.changes === 0) {
                return res.status(404).json({ message: "Record not found" });
            }

            res.json({ message: "✅ Record updated successfully" });
        }
    );
});




