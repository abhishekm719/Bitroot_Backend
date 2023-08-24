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
  const { name, phone_numbers, email, image } = req.body;

  // Check if any of the phone numbers are already in the database
  connection.query(
    "SELECT * FROM phone_numbers WHERE phone_number IN (?)",
    [phone_numbers],
    (err, phoneResults) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (phoneResults.length > 0) {
        res.status(400).json({ error: "Phone number already exists" });
      } else {
        // Insert the new contact into the contacts table
        const contactInsertQuery = `
        INSERT INTO contacts (name, email, image) VALUES (?, ?, ?)
      `;

        connection.query(
          contactInsertQuery,
          [name, email, image],
          (err, contactResult) => {
            if (err) {
              res.status(500).json({ error: err.message });
            } else {
              const contactId = contactResult.insertId;

              // Insert the phone numbers into the phone_numbers table
              const phoneValues = phone_numbers.map((phone) => [
                contactId,
                phone,
              ]);

              const phoneInsertQuery = `
              INSERT INTO phone_numbers (contact_id, phone_number) VALUES ?
            `;

              connection.query(phoneInsertQuery, [phoneValues], (err) => {
                if (err) {
                  res.status(500).json({ error: err.message });
                } else {
                  res
                    .status(201)
                    .json({ message: "Contact created successfully" });
                }
              });
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
  // Delete the contact from the contacts table
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
  // Fetch all contacts with their associated phone numbers from the database
  // ...
  connection.query(
    "SELECT c.id, c.name, c.email, c.image, p.phone_number FROM contacts c LEFT JOIN phone_numbers p ON c.id = p.contact_id;",
    (err, results) => {
      if (err) {
        console.error("Error fetching contacts:", err);
        res.status(500).json({ error: err.message });
      } else {
        console.log("Fetched contacts:", results); // Log the fetched results
        res.status(200).json({ contacts: results });
      }
    }
  );
  // ...
});
// Start the server
app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
