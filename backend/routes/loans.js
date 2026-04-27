import express from "express";
import { db } from "../db.js";

const router = express.Router();

// GET all loans
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT l.*, b.title, p.name AS patron_name
      FROM loans l
      JOIN books b ON l.inventory_id = (
        SELECT inventory_id FROM inventory WHERE book_id = b.book_id LIMIT 1
      )
      JOIN patrons p ON l.patron_id = p.patron_id
      ORDER BY l.due_date ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching loans:", err);
    res.status(500).json({ error: "Failed to load loans" });
  }
});

// POST create a loan
router.post("/", async (req, res) => {
  const { book_id, patron_id } = req.body;

  try {
    // Find an available inventory item for this book
    const [inventory] = await db.query(`
      SELECT inventory_id FROM inventory 
      WHERE book_id = ? AND copies_available > 0 
      LIMIT 1
    `, [book_id]);

    if (inventory.length === 0)
      return res.status(400).json({ error: "No copies available" });

    const inventory_id = inventory[0].inventory_id;
    const checkout_date = new Date().toISOString().split("T")[0];
    const due_date = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    // Create the loan
    await db.query(`
      INSERT INTO loans (inventory_id, patron_id, checkout_date, due_date, status)
      VALUES (?, ?, ?, ?, 'active')
    `, [inventory_id, patron_id, checkout_date, due_date]);

    // Decrement available copies
    await db.query(`
      UPDATE inventory SET copies_available = copies_available - 1
      WHERE inventory_id = ?
    `, [inventory_id]);

    res.json({ success: true, due_date });
  } catch (err) {
    console.error("Error creating loan:", err);
    res.status(500).json({ error: "Failed to create loan" });
  }
});

// PUT return a loan
router.put("/:id/return", async (req, res) => {
  try {
    await db.query(`
      UPDATE loans SET status = 'returned', return_date = CURDATE()
      WHERE loan_id = ?
    `, [req.params.id]);

    await db.query(`
      UPDATE inventory SET copies_available = LEAST(copies_available + 1, copies_total)
      WHERE inventory_id = (SELECT inventory_id FROM loans WHERE loan_id = ?)
    `, [req.params.id]);

    res.json({ success: true });
  } catch (err) {
    console.error("Error returning loan:", err);
    res.status(500).json({ error: "Failed to return loan" });
  }
});

export default router;