import express from "express";
import { db } from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [[counts]] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM books) AS totalBooks,
        (SELECT COUNT(*) FROM patrons) AS totalPatrons,
        (SELECT COUNT(*) FROM loans WHERE status = 'active') AS activeLoans,
        (SELECT COUNT(*) FROM reservations) AS totalHolds
    `);

    res.json(counts);
  } catch (err) {
    console.error("Error fetching metrics:", err);
    res.status(500).json({ error: "Failed to load metrics" });
  }
});

export default router;
