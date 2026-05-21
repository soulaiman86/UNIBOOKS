const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/authenticateToken');

// مسار إضافة تقييم جديد
router.post('/add', authenticateToken, async (req, res) => {
    const { order_id, rating, comment } = req.body;
    const buyer_id = req.user.id;

    try {
        
        // 1. التحقق من الطلب وجلب معرف البائع عبر الربط مع جدول الكتب
const orderCheck = await pool.query(
    `SELECT o.*, b.seller_id 
     FROM orders o 
     JOIN books b ON o.book_id = b.id 
     WHERE o.id = $1 AND o.user_id = $2`,
    [order_id, buyer_id]
);

if (orderCheck.rows.length === 0) {
    return res.status(404).json({ message: "The request does not exist or you do not have the authority to evaluate it." });
}

const order = orderCheck.rows[0];


        if (order.status !== 'Delivered') {
            return res.status(400).json({ message: "You can only rate the order after you receive it and change its status to Delivered" });
        }

        // 2. التحقق مما إذا كان المستخدم قد قيم هذا الطلب مسبقاً (منع التكرار)
        const reviewCheck = await pool.query(
            `SELECT * FROM reviews WHERE order_id = $1`,
            [order_id]
        );

        if (reviewCheck.rows.length > 0) {
            return res.status(400).json({ message: "I have already assessed this request." });
        }

        // 3. إدخال التقييم في قاعدة البيانات
        const seller_id = order.seller_id; // تأكد أن seller_id موجود في جدول orders أو اجلبه عبر الربط
        
        const newReview = await pool.query(
            `INSERT INTO reviews (buyer_id, seller_id, order_id, rating, comment) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [buyer_id, seller_id, order_id, rating, comment]
        );

        // 4. إرسال رسالة نظام للبائع لإعلامه بالتقييم الجديد (اختياري)
        const notificationText = `⭐ New rating! The buyer has rated you ${rating} stars for order #${order_id}`;
        await pool.query(
            `INSERT INTO messages (sender_id, receiver_id, message) VALUES ($1, $2, $3)`,
            [buyer_id, seller_id, notificationText]
        );

        res.status(201).json({ message: "Your review has been successfully added, thank you!", review: newReview.rows[0] });

    } catch (err) {
        console.error("Review Error:", err.message);
        res.status(500).json({ message: "An error occurred while adding the rating" });
    }
});
// جلب التقييمات الخاصة بكتاب معين لعرضها في صفحة الكتاب
router.get('/book/:bookId', async (req, res) => {
    try {
        const { bookId } = req.params;

        const result = await pool.query(
            `SELECT 
                r.id, 
                r.rating, 
                r.comment, 
                r.created_at, 
                u.name AS buyer_name 
             FROM reviews r
             JOIN orders o ON r.order_id = o.id
             JOIN users u ON r.buyer_id = u.id
             WHERE o.book_id = $1
             ORDER BY r.created_at DESC`,
            [bookId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error("Fetch Book Reviews Error:", err.message);
        res.status(500).json({ message: "Error in retrieving book ratings" });
    }
});

module.exports = router;