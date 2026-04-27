import express from "express";
import { db } from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM patrons ORDER BY lastName ASC");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching patrons:", err);
    res.status(500).json({ error: "Failed to load patrons" });
  }
});

// GET loans for a specific patron
router.get("/:id/loans", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT l.loan_id AS id, l.status, l.due_date AS dueDate, 
        b.title AS bookTitle
      FROM loans l
      JOIN inventory i ON l.inventory_id = i.inventory_id
      JOIN books b ON i.book_id = b.book_id
      WHERE l.patron_id = ?
      ORDER BY l.due_date ASC
    `, [req.params.id]);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching patron loans:", err);
    res.status(500).json({ error: "Failed to load loans" });
  }
});

// GET holds for a specific patron
router.get("/:id/holds", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT r.reservation_id AS id, r.status,
        b.title AS bookTitle
      FROM reservations r
      JOIN books b ON r.book_id = b.book_id
      WHERE r.patron_id = ?
      ORDER BY r.reservation_date ASC
    `, [req.params.id]);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching patron holds:", err);
    res.status(500).json({ error: "Failed to load holds" });
  }
});

export default router;
