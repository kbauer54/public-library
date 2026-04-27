import express from "express";
import { db } from "../db.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { patronId, bookId } = req.body;

  try {
    // Insert new reservation
    await db.query(
      `INSERT INTO reservations (patron_id, book_id, status, reservation_date)
       VALUES (?, ?, 'waiting', NOW())`,
      [patronId, bookId]
    );

    // Fetch updated holds for this patron
    const [updatedHolds] = await db.query(`
      SELECT 
        r.reservation_id AS id,
        r.status,
        r.reservation_date,
        b.title AS bookTitle,
        p.name AS patronName,
        br.name AS pickupBranch
      FROM reservations r
      LEFT JOIN books b ON r.book_id = b.book_id
      LEFT JOIN patrons p ON r.patron_id = p.patron_id
      LEFT JOIN branches br ON p.home_branch_id = br.branch_id
      WHERE r.patron_id = ?
      ORDER BY r.reservation_date DESC
    `, [patronId]);

    res.json({
      success: true,
      holds: updatedHolds
    });

  } catch (err) {
    console.error("Error creating reservation:", err);
    res.status(500).json({ error: "Failed to create reservation" });
  }
});

//GET all holds (Staff Dashboard)
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        r.reservation_id AS id,
        r.status,
        r.reservation_date,
        b.title AS title,
        br.name AS pickup_branch
      FROM reservations r
      JOIN books b ON r.book_id = b.book_id
      LEFT JOIN patrons p ON r.patron_id = p.patron_id
      LEFT JOIN branches br ON p.home_branch_id = br.branch_id
      ORDER BY r.reservation_date DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error("Error fetching holds:", err);
    res.status(500).json({ error: "Failed to load holds" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM reservations WHERE reservation_id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Error cancelling hold:", err);
    res.status(500).json({ error: "Failed to cancel hold" });
  }
});

export default router;