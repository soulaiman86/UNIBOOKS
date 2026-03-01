const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const path = require('path');

// 1. إعدادات تخزين الملفات (Multer Storage)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // المجلد الذي أنشأته
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // اسم الصورة + تاريخ الآن
  }
});

const upload = multer({ storage: storage });

// 2. تعديل مسار الإضافة ليقبل ملف "image"
router.post('/add', upload.single('image'), async (req, res) => {
  try {
    const { seller_id, title, description, price, category } = req.body;
    
    // بناء رابط الصورة الكامل للوصول إليه من المتصفح
    const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;

    const newBook = await pool.query(
      "INSERT INTO books (seller_id, title, description, price, category, image_urls) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [seller_id, title, description, price, category, [imageUrl]] // وضع الرابط داخل مصفوفة
    );

    res.status(201).json(newBook.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server Error" });
  }
});

// مسار جلب الكتب يبقى كما هو
router.get('/', async (req, res) => {
  try {
    const allBooks = await pool.query("SELECT * FROM books ORDER BY created_at DESC");
    res.json(allBooks.rows);
  } catch (err) {
    console.error(err.message);
  }
});

// جلب تفاصيل كتاب واحد بواسطة الـ ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const book = await pool.query("SELECT * FROM books WHERE id = $1", [id]);

    if (book.rows.length === 0) {
      return res.status(404).json({ error: "The book is not available." });
    }

    res.json(book.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;