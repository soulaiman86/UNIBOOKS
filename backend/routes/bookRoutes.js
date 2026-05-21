const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const path = require('path');

// 1. إعدادات تخزين الملفات (Multer Storage)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});

const upload = multer({ storage: storage });

// 2. تعديل مسار الإضافة ليقبل "condition" وصورة الكتاب
router.post('/add', upload.single('image'), async (req, res) => {
  try {
    const { seller_id, title, description, price, stock, category, condition } = req.body;

    // التحقق من عدد الكتب والاشتراك
    const booksCount = await pool.query(
      `SELECT COUNT(*) FROM books WHERE seller_id = $1`, [seller_id]
    );
    const count = parseInt(booksCount.rows[0].count);

    if (count >= 3) {
      const subscription = await pool.query(
        `SELECT * FROM subscriptions 
         WHERE seller_id = $1 
         AND status = 'active' 
         AND end_date > NOW()
         LIMIT 1`,
        [seller_id]
      );

      if (subscription.rows.length === 0) {
        return res.status(403).json({ 
          error: "SUBSCRIPTION_REQUIRED",
          message: "You need an active subscription to add more than 3 books."
        });
      }
    }

    const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;

    const newBook = await pool.query(
      "INSERT INTO books (seller_id, title, description, price, stock, category, image_urls, condition) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [seller_id, title, description, price, stock, category, [imageUrl], condition]
    );

    res.status(201).json(newBook.rows[0]);
  } catch (err) {
    console.error("Add Book Error:", err.message);
    res.status(500).json({ error: "Server Error" });
  }
});

// جلب الكتب مع تفاصيل البائعين (اختياري لتحسين العرض العام)
router.get('/', async (req, res) => {
  try {
    const { search, category, condition, seller, min_price, max_price } = req.query;

    let query = `
        SELECT * FROM (
            SELECT DISTINCT ON (b.id) b.*, u.name as seller_name,
                   s.plan_type, s.start_date as sub_start_date,
                   CASE 
                       WHEN s.plan_type = 'annual' THEN 1
                       WHEN s.plan_type = 'semi-annual' THEN 2
                       WHEN s.plan_type = 'monthly' THEN 3
                       ELSE 4
                   END AS priority
            FROM books b 
            JOIN users u ON b.seller_id = u.id 
            LEFT JOIN subscriptions s ON s.seller_id = b.seller_id 
                AND s.status = 'active' 
                AND s.end_date > NOW()
            WHERE 1=1
    `;

    let params = [];
    let i = 1;

    if (search) {
      query += ` AND b.title ILIKE $${i}`;
      params.push(`%${search}%`);
      i++;
    }
    if (category) {
      query += ` AND b.category = $${i}`;
      params.push(category);
      i++;
    }
    if (condition) {
      query += ` AND b.condition = $${i}`;
      params.push(condition);
      i++;
    }
    if (seller) {
      query += ` AND u.name ILIKE $${i}`;
      params.push(`%${seller}%`);
      i++;
    }
    if (min_price) {
      query += ` AND b.price >= $${i}`;
      params.push(min_price);
      i++;
    }
    if (max_price) {
      query += ` AND b.price <= $${i}`;
      params.push(max_price);
      i++;
    }

    query += `) AS subquery ORDER BY priority ASC, sub_start_date ASC NULLS LAST, created_at DESC`;

    const allBooks = await pool.query(query, params);
    res.json(allBooks.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server Error" });
  }
});

// جلب تفاصيل كتاب واحد مع بيانات البائع ومتوسط تقييمه العام
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const book = await pool.query(`
      SELECT 
        b.*, 
        u.name as seller_name, 
        u.profile_image as seller_image,
        (SELECT AVG(rating) FROM reviews WHERE seller_id = u.id) as seller_avg_rating,
        (SELECT COUNT(*) FROM reviews WHERE seller_id = u.id) as seller_review_count
      FROM books b 
      JOIN users u ON b.seller_id = u.id 
      WHERE b.id = $1`, 
      [id]
    );

    if (book.rows.length === 0) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json(book.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server Error" });
  }
});

// Update a book by ID
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, category, condition, stock } = req.body;

let query = "UPDATE books SET title = $1, description = $2, price = $3, category = $4, condition = $5, stock = $6";
let params = [title, description, price, category, condition, stock, id];

if (req.file) {
    const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    query += ", image_urls = $7 WHERE id = $8";
    params = [title, description, price, category, condition, stock, [imageUrl], id];
} else {
    query += " WHERE id = $7";
}

    const updateBook = await pool.query(query, params);

    if (updateBook.rowCount === 0) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json({ message: "Book was updated successfully!" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server Error" });
  }
});

// Delete a book by ID (لا يحتاج تعديل)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleteBook = await pool.query("DELETE FROM books WHERE id = $1", [id]);

    if (deleteBook.rowCount === 0) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json({ message: "Book was deleted successfully!" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;