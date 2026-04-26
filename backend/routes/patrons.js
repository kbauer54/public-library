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

export default router;
