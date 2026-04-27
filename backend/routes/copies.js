import express from "express";
import { db } from "../db.js";

const router = express.Router();

// GET all copies
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT copies.*, books.title, books.isbn, books.status  
      FROM copies
      JOIN books ON copies.bookId = books.id
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching copies:", err);
    res.status(500).json({ error: "Failed to load copies" });
  }
});

export default router;
