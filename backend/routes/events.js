import express from "express";
import { db } from "../db.js";

const router = express.Router();

// GET /events — return all events
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        e.event_id AS id,
        e.name AS title,
        e.description,
        e.event_date AS date,
        e.capacity,
        b.name AS location
      FROM events e
      LEFT JOIN branches b ON e.branch_id = b.branch_id
      ORDER BY e.event_date ASC
    `);

    res.json({ data: rows });
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ error: "Failed to load events" });
  }
});

// GET /events/:id — single event
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM events WHERE event_id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching event:", err);
    res.status(500).json({ error: "Failed to load event" });
  }
});

export default router;