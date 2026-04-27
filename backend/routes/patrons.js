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
             b.title AS bookTitle, b.author
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
      SELECT h.hold_id AS id, h.status, h.position,
             b.title AS bookTitle, b.author
      FROM holds h
      JOIN books b ON h.book_id = b.book_id
      WHERE h.patron_id = ?
      ORDER BY h.created_at ASC
    `, [req.params.id]);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching patron holds:", err);
    res.status(500).json({ error: "Failed to load holds" });
  }
});

export default router;
