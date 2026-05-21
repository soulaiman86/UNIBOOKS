const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const path = require('path');

// إعداد multer لرفع وصل الدفع
const storageProof = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, 'proof_' + Date.now() + path.extname(file.originalname))
});
const uploadProof = multer({ storage: storageProof });

router.get('/seller-stats/:seller_id', async (req, res) => {
    try {
        const { seller_id } = req.params;

        const totalBooks = await pool.query(
            `SELECT COUNT(*) FROM books WHERE seller_id = $1`, [seller_id]
        );
        const totalOrders = await pool.query(
            `SELECT COUNT(*) FROM orders o JOIN books b ON o.book_id = b.id WHERE b.seller_id = $1`, [seller_id]
        );
        const totalRevenue = await pool.query(
            `SELECT COALESCE(SUM(o.total_price), 0) AS revenue FROM orders o JOIN books b ON o.book_id = b.id WHERE b.seller_id = $1 AND o.status = 'Delivered'`, [seller_id]
        );
        const ordersByStatus = await pool.query(
            `SELECT o.status, COUNT(*) as count FROM orders o JOIN books b ON o.book_id = b.id WHERE b.seller_id = $1 GROUP BY o.status`, [seller_id]
        );

        res.json({
            totalBooks: totalBooks.rows[0].count,
            totalOrders: totalOrders.rows[0].count,
            totalRevenue: totalRevenue.rows[0].revenue,
            ordersByStatus: ordersByStatus.rows,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
});
// جلب كتب البائع
router.get('/books/:seller_id', async (req, res) => {
    try {
        const { seller_id } = req.params;
        const result = await pool.query(
            `SELECT id, title, price, stock, created_at 
             FROM books 
             WHERE seller_id = $1 
             ORDER BY created_at DESC`,
            [seller_id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

// حذف كتاب
router.delete('/books/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query(`DELETE FROM books WHERE id = $1`, [id]);
        res.json({ message: "Book deleted successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

// جلب عدد كتب البائع
router.get('/books-count/:seller_id', async (req, res) => {
    try {
        const { seller_id } = req.params;
        const result = await pool.query(
            `SELECT COUNT(*) FROM books WHERE seller_id = $1`,
            [seller_id]
        );
        res.json({ count: parseInt(result.rows[0].count) });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

// التحقق من اشتراك البائع
router.get('/subscription/:seller_id', async (req, res) => {
    try {
        const { seller_id } = req.params;
        const result = await pool.query(
            `SELECT * FROM subscriptions 
             WHERE seller_id = $1 
             AND status = 'active' 
             AND end_date > NOW()
             ORDER BY end_date DESC 
             LIMIT 1`,
            [seller_id]
        );
        res.json({ hasActiveSubscription: result.rows.length > 0, subscription: result.rows[0] || null });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

// إرسال طلب اشتراك مع وصل الدفع
router.post('/subscription/request', uploadProof.single('payment_proof'), async (req, res) => {
    try {
        const { seller_id, plan_type, price } = req.body;
        const paymentProofUrl = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : null;

        if (!paymentProofUrl) {
            return res.status(400).json({ error: "Payment proof is required" });
        }

        // حساب تاريخ البداية والنهاية حسب الخطة
        const startDate = new Date();
        const endDate = new Date();
        if (plan_type === 'monthly') endDate.setMonth(endDate.getMonth() + 1);
        else if (plan_type === 'semi-annual') endDate.setMonth(endDate.getMonth() + 6);
        else if (plan_type === 'annual') endDate.setFullYear(endDate.getFullYear() + 1);

        const result = await pool.query(
            `INSERT INTO subscriptions (seller_id, plan_type, price, start_date, end_date, status, payment_proof, payment_status)
             VALUES ($1, $2, $3, $4, $5, 'pending', $6, 'pending') RETURNING *`,
            [seller_id, plan_type, price, startDate, endDate, paymentProofUrl]
        );

        res.status(201).json({ message: "Subscription request sent successfully!", subscription: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

module.exports = router;