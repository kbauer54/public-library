import express from "express";
import { db } from "../db.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { bookId, patronId } = req.body;

  if (!bookId || !patronId) {
    return res.status(400).json({ success: false, message: "Missing data" });
  }

  try {
    // 1. Check inventory (any branch with available copies)
    const [rows] = await db.query(
      `SELECT * FROM inventory WHERE book_id = ? AND copies_available > 0 LIMIT 1`,
      [bookId]
    );

    if (rows.length === 0) {
      return res.json({ success: false, message: "No available copies" });
    }

    const inventoryItem = rows[0];

    // 2. Reduce available copies
    await db.query(
      `UPDATE inventory 
       SET copies_available = copies_available - 1 
       WHERE inventory_id = ?`,
      [inventoryItem.inventory_id]
    );

    // 3. Create loan record
    await db.query(
      `INSERT INTO loans (book_id, patron_id, due_date)
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 14 DAY))`,
      [bookId, patronId]
    );

    // 4. Update patron loan count
    await db.query(
      `UPDATE patrons 
       SET current_loans = current_loans + 1 
       WHERE patron_id = ?`,
      [patronId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ success: false, message: "Checkout failed" });
  }
});

export default router;