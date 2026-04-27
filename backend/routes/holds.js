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
