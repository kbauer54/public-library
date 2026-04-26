import express from "express";
import { db } from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM branches ORDER BY name ASC");
    res.json({ data: rows });
  } catch (err) {
    console.error("Error fetching branches:", err);
    res.status(500).json({ error: "Failed to load branches" });
  }
});

export default router;
