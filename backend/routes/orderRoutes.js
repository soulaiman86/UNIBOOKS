const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/authenticateToken');

// 1. إتمام عملية الشراء
router.post('/place-order', authenticateToken, async (req, res) => {
    const client = await pool.connect(); 
    try {
        const { phone_number, address } = req.body;
        const user_id = req.user.id;

        if (!phone_number || !address) {
            return res.status(400).json({ message: "Missing required shipping information" });
        }

        await client.query('BEGIN');

        const cartItems = await client.query(
            `SELECT cart.book_id, cart.quantity, books.price, books.stock, books.title 
             FROM cart 
             JOIN books ON cart.book_id = books.id 
             WHERE cart.user_id = $1`, [user_id]
        );

        if (cartItems.rows.length === 0) {
            throw new Error("Cart is empty");
        }

        const totalPrice = cartItems.rows.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const mainBookId = cartItems.rows[0].book_id;

        // إدخال الطلب الرئيسي
        const newOrder = await client.query(
            `INSERT INTO orders (user_id, book_id, total_price, phone_number, address, status) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            [user_id, mainBookId, totalPrice, phone_number, address, 'Pending']
        );
        
        const orderId = newOrder.rows[0].id; // تعريف المعرف هنا لاستخدامه في الأسفل

        for (const item of cartItems.rows) {
            if (item.stock < item.quantity) {
                throw new Error(`Not enough stock for: ${item.title}`);
            }

            await client.query(
                'INSERT INTO order_items (order_id, book_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4)',
                [orderId, item.book_id, item.quantity, item.price]
            );

            await client.query(
                'UPDATE books SET stock = stock - $1 WHERE id = $2',
                [item.quantity, item.book_id]
            );
        }

        await client.query('DELETE FROM cart WHERE user_id = $1', [user_id]);
        await client.query('COMMIT'); 
        res.json({ message: "Order placed successfully!", orderId });

    } catch (err) {
        await client.query('ROLLBACK'); 
        console.error("Order Error:", err.message);
        res.status(400).json({ message: err.message });
    } finally {
        client.release();
    }
});

// 2. جلب طلبات المشتري (نسخة مصححة)
router.get('/my-orders', authenticateToken, async (req, res) => {
    try {
        const user_id = req.user.id;
        const result = await pool.query(
            `SELECT 
                o.id AS order_id, 
                o.total_price, 
                o.status, 
                o.created_at,
                b.title AS book_title, 
                COALESCE(b.image_urls, ARRAY['/uploads/default.png']) AS image_urls,
                u.name AS seller_name, 
                u.id AS seller_id,
                r.id AS reclamation_id
             FROM orders o
             LEFT JOIN books b ON o.book_id = b.id
             LEFT JOIN users u ON b.seller_id = u.id
             LEFT JOIN reclamations r ON r.order_id = o.id
             WHERE o.user_id = $1
             ORDER BY o.created_at DESC`,
            [user_id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Fetch Orders Error:", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// 3. جلب طلبات البائع
router.get('/seller-orders', authenticateToken, async (req, res) => {
    try {
        const seller_id = req.user.id;
        const result = await pool.query(
            `SELECT 
                o.id AS order_id, o.total_price, o.status, o.created_at,
                b.title AS book_title, b.image_urls,
                u.name AS buyer_name, u.id AS buyer_id,
                r.id AS reclamation_id
             FROM orders o
             JOIN books b ON o.book_id = b.id
             JOIN users u ON o.user_id = u.id
             LEFT JOIN reclamations r ON r.order_id = o.id
             WHERE b.seller_id = $1
             ORDER BY o.created_at DESC`,
            [seller_id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// 4. إلغاء الطلب (من قبل المشتري)
router.put('/cancel-order/:orderId', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { orderId } = req.params;
        const current_user_id = req.user.id;

        await client.query('BEGIN');

        const orderRes = await client.query(
            `SELECT o.*, b.seller_id 
             FROM orders o 
             LEFT JOIN books b ON o.book_id = b.id 
             WHERE o.id = $1`, [orderId]
        );

        if (orderRes.rows.length === 0) return res.status(404).json({ message: "Order not found" });
        const order = orderRes.rows[0];

        if (order.user_id !== current_user_id) return res.status(403).json({ message: "Unauthorized" });
        if (order.status !== 'Pending') return res.status(400).json({ message: "Cannot cancel now" });
        if (!order.book_id) return res.status(400).json({ message: "System error: book_id missing" });

        await client.query(`UPDATE orders SET status = 'Cancelled' WHERE id = $1`, [orderId]);
        await client.query(`UPDATE books SET stock = stock + 1 WHERE id = $1`, [order.book_id]);

        const notificationText = `⚠️ System Message: The buyer has cancelled this order. The item has been returned to your stock.`;
        await client.query(
            `INSERT INTO messages (sender_id, receiver_id, message) VALUES ($1, $2, $3)`,
            [current_user_id, order.seller_id, notificationText]
        );

        await client.query('COMMIT');
        res.json({ message: "Order cancelled successfully" });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(500).json({ message: "Internal Server Error" });
    } finally {
        client.release();
    }
});

// 5. جلب الرسائل
router.get('/chat/:other_party_id', authenticateToken, async (req, res) => {
    try {
        const my_id = req.user.id;
        const { other_party_id } = req.params;
        const result = await pool.query(
            `SELECT * FROM messages 
             WHERE (sender_id = $1 AND receiver_id = $2) 
                OR (sender_id = $2 AND receiver_id = $1)
             ORDER BY created_at ASC`,
            [my_id, other_party_id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: "Error fetching messages" });
    }
});

// 6. إرسال رسالة
router.post('/chat/send', authenticateToken, async (req, res) => {
    try {
        const sender_id = req.user.id;
        const { receiver_id, message } = req.body;
        const result = await pool.query(
            `INSERT INTO messages (sender_id, receiver_id, message) 
             VALUES ($1, $2, $3) RETURNING *`,
            [sender_id, receiver_id, message]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: "Error sending message" });
    }
});
// 7. تحديث حالة الطلب (من قبل البائع)
router.put('/update-status/:orderId', authenticateToken, async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body; // القيمة الجديدة المرسلة من الفرونت-إند (مثل 'Delivered')
        const seller_id = req.user.id;

        // 1. التحقق من أن المستخدم هو صاحب الكتاب (البائع الأصلي)
        const checkOwnership = await pool.query(
            `SELECT b.seller_id 
             FROM orders o 
             JOIN books b ON o.book_id = b.id 
             WHERE o.id = $1`, [orderId]
        );

        if (checkOwnership.rows.length === 0) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (checkOwnership.rows[0].seller_id !== seller_id) {
            return res.status(403).json({ message: "Unauthorized: You are not the seller of this item" });
        }

        // 2. تحديث الحالة في قاعدة البيانات
        const updateResult = await pool.query(
            `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
            [status, orderId]
        );

        res.json({ message: "Status updated successfully", order: updateResult.rows[0] });

    } catch (err) {
        console.error("Update Status Error:", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;