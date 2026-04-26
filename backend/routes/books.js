import express from "express";
import { db } from "../db.js";

const router = express.Router();

// GET all books
router.get("/", async (req, res) => {
  try {
    // Get all books with author and genre
    const [books] = await db.query(`
      SELECT 
        b.book_id AS id,
        b.title,
        b.isbn,
        b.publication_year AS year,
        TRIM(g.genre_name) AS category,
        GROUP_CONCAT(DISTINCT a.name ORDER BY a.name SEPARATOR ', ') AS author
      FROM books b
      LEFT JOIN genres g ON b.genre_id = g.genre_id
      LEFT JOIN bookauthors ba ON b.book_id = ba.book_id
      LEFT JOIN authors a ON ba.author_id = a.author_id
      GROUP BY b.book_id, b.title, b.isbn, b.publication_year, g.genre_name
      ORDER BY b.title ASC
    `);

    // Get inventory/branches for each book
    const [inventory] = await db.query(`
      SELECT 
        i.book_id,
        br.name,
        i.copies_available AS available,
        i.copies_total AS total
      FROM inventory i
      JOIN branches br ON i.branch_id = br.branch_id
    `);

    // Attach branches to each book
    const result = books.map((book) => {
      const branches = inventory.filter((i) => i.book_id === book.id);
      const totalAvailable = branches.reduce((sum, b) => sum + b.available, 0);
      return {
        ...book,
        format: "Book",
        description: "",
        coverImage: book.isbn ? `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg` : "",
        subjects: [],
        available: totalAvailable > 0,
        branches,
      };
    });

    res.json({ data: result });
  } catch (err) {
    console.error("Error fetching books:", err);
    res.status(500).json({ error: "Failed to load books" });
  }
});

// GET single book
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM books WHERE book_id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0)
      return res.status(404).json({ error: "Book not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching book:", err);
    res.status(500).json({ error: "Failed to load book" });
  }
});

export default router;