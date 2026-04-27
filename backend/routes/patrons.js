import express from "express";
import { db } from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        patron_id AS id,
        name,
        email,
        membership_date,
        home_branch_id
      FROM patrons
      ORDER BY name ASC
    `);

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
      WHERE l.patron_id = ? AND l.status = 'active'
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
        b.title AS bookTitle,
        ROW_NUMBER() OVER (PARTITION BY r.book_id ORDER BY r.reservation_date) AS position
      FROM reservations r
      JOIN books b ON r.book_id = b.book_id
      WHERE r.patron_id = ? AND r.status = 'waiting'
      ORDER BY r.reservation_date ASC
    `, [req.params.id]);
    
    res.json(rows);
  } catch (err) {
    console.error("Error fetching patron holds:", err);
    res.status(500).json({ error: "Failed to load holds" });
  }
});

export default router;
