import express from "express";
import { db } from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        r.reservation_id AS id,
        r.status,
        r.reservation_date,
        b.title,
        p.name AS patron_name,
        br.name AS pickup_branch
      FROM reservations r
      LEFT JOIN books b ON r.book_id = b.book_id
      LEFT JOIN patrons p ON r.patron_id = p.patron_id
      LEFT JOIN branches br ON p.home_branch_id = br.branch_id
      ORDER BY r.reservation_date DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching reservations:", err);
    res.status(500).json({ error: "Failed to load reservations" });
  }
});

export default router;
