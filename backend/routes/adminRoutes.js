const express = require('express');
const router = express.Router();
const pool = require('../db');

// جلب إحصائيات لوحة التحكم
router.get('/stats', async (req, res) => {
    try {
        const totalUsers = await pool.query(`SELECT COUNT(*) FROM users`);
        const totalSellers = await pool.query(`SELECT COUNT(*) FROM users WHERE role = 'SELLER'`);
        const totalBuyers = await pool.query(`SELECT COUNT(*) FROM users WHERE role = 'BUYER'`);
        const totalBooks = await pool.query(`SELECT COUNT(*) FROM books`);
        const totalOrders = await pool.query(`SELECT COUNT(*) FROM orders`);
        const totalRevenue = await pool.query(`SELECT COALESCE(SUM(total_price), 0) AS revenue FROM orders WHERE status = 'Delivered'`);
        const ordersByStatus = await pool.query(`SELECT status, COUNT(*) as count FROM orders GROUP BY status`);
        const totalReclamations = await pool.query(`SELECT COUNT(*) FROM reclamations`);

        res.json({
            totalUsers: totalUsers.rows[0].count,
            totalSellers: totalSellers.rows[0].count,
            totalBuyers: totalBuyers.rows[0].count,
            totalBooks: totalBooks.rows[0].count,
            totalOrders: totalOrders.rows[0].count,
            totalRevenue: totalRevenue.rows[0].revenue,
            ordersByStatus: ordersByStatus.rows,
            totalReclamations: totalReclamations.rows[0].count,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
});
// جلب جميع المستخدمين
router.get('/users', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT DISTINCT ON (u.id) 
                    u.id, u.name, u.email, u.role, u.created_at,
                    s.plan_type as subscription_plan,
                    s.end_date as subscription_end,
                    s.status as subscription_status
             FROM users u
             LEFT JOIN subscriptions s ON s.seller_id = u.id 
                AND s.status = 'active' 
                AND s.end_date > NOW()
             ORDER BY u.id, s.end_date DESC NULLS LAST`
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

// حذف مستخدم
router.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
});
// جلب جميع الكتب
router.get('/books', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT b.id, b.title, b.price, b.stock, b.created_at,
                    u.name AS seller_name
             FROM books b
             JOIN users u ON b.seller_id = u.id
             ORDER BY b.created_at DESC`
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

// جلب جميع طلبات الاشتراك
router.get('/subscriptions', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT s.*, u.name as seller_name, u.email as seller_email
             FROM subscriptions s
             JOIN users u ON s.seller_id = u.id
             ORDER BY s.start_date DESC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

// تفعيل أو رفض اشتراك
router.put('/subscriptions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body;

        const newStatus = action === 'approve' ? 'active' : 'rejected';
        const paymentStatus = action === 'approve' ? 'verified' : 'rejected';

        const result = await pool.query(
            `UPDATE subscriptions 
             SET status = $1, payment_status = $2 
             WHERE id = $3 RETURNING *`,
            [newStatus, paymentStatus, id]
        );

        const subscription = result.rows[0];

        // إرسال إشعار للبائع
        if (action === 'approve') {
            const endDate = new Date(subscription.end_date).toLocaleDateString();
            await pool.query(
                `INSERT INTO notifications (user_id, message) VALUES ($1, $2)`,
                [subscription.seller_id, `✅ Your subscription has been activated! It is valid until ${endDate}.`]
            );
        } else {
            await pool.query(
                `INSERT INTO notifications (user_id, message) VALUES ($1, $2)`,
                [subscription.seller_id, `❌ Your subscription request has been rejected. Please contact support for more information.`]
            );
        }

        res.json({ message: `Subscription ${newStatus}`, subscription });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

module.exports = router;