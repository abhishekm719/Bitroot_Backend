const express = require("express");
const mysql = require("mysql");
const app = express();

app.use(express.json());
// Create a connection to the MySQL database
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "contact_list",
});
// Create a new contact
app.post("/contacts", (req, res) => {
  const { name, phone_number, email, image } = req.body;
  // Check if the phone number is already in the database
  connection.query(
    "SELECT * FROM contacts WHERE phone_number = ?",
    [phone_number],
    (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (results.length > 0) {
        res.status(400).json({ error: "Phone number already exists" });
      } else {
        // Insert the new contact into the database
        connection.query(
          "INSERT INTO contacts (name, phone_number, email, image) VALUES (?, ?, ?, ?)",
          [name, phone_number, email, image],
          (err, results) => {
            if (err) {
              res.status(500).json({ error: err.message });
            } else {
              res.status(201).json({ message: "Contact created successfully" });
            }
          }
        );
      }
    }
  );
});
// Delete a contact
app.delete("/contacts/:id", (req, res) => {
  const { id } = req.params;
  // Delete the contact from the database
  connection.query(
    "DELETE FROM contacts WHERE id = ?",
    [id],
    (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(200).json({ message: "Contact deleted successfully" });
      }
    }
  );
});
// Fetch all contacts
app.get("/contacts", (req, res) => {
  // Fetch all contacts from the database
  connection.query("SELECT * FROM contacts", (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json({ contacts: results });
    }
  });
});
// Start the server
app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
