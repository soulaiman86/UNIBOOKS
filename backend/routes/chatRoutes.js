const express = require('express');
const router = express.Router();
const pool = require('../db'); // تأكد أن هذا هو الملف الصحيح للاتصال بـ Postgres

// جلب رسائل المحادثة الثلاثية
router.get('/chat/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const { reclamation_id } = req.query;
        const parsedOrderId = parseInt(orderId);

        if (isNaN(parsedOrderId)) {
            return res.status(400).json({ error: "Order ID must be a number" });
        }

        let query;
        let queryParams;

        if (reclamation_id && reclamation_id !== 'undefined' && reclamation_id !== 'null' && reclamation_id.length > 10) {
            // ✅ جلب من reclamation_messages بدل messages
            query = `
                SELECT m.id, m.sender_id, m.message_text as message, 
                       m.created_at, u.name as sender_name, u.role as sender_role
                FROM reclamation_messages m
                JOIN users u ON m.sender_id = u.id
                WHERE m.reclamation_id = $1::uuid
                ORDER BY m.created_at ASC
            `;
            queryParams = [reclamation_id];
        } else {
            query = `
                SELECT m.*, u.name as sender_name, u.role as sender_role
                FROM messages m
                JOIN users u ON m.sender_id = u.id
                WHERE m.order_id = $1 AND m.reclamation_id IS NULL
                ORDER BY m.created_at ASC
            `;
            queryParams = [parsedOrderId];
        }

        const result = await pool.query(query, queryParams);
        res.json(result.rows);

    } catch (err) {
        console.error("❌ POSTGRES CHAT ERROR:", err.message);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
});

// ✅ إرسال رسالة من البائع أو المشتري في المحادثة الثلاثية
router.post('/chat/send', async (req, res) => {
    try {
        const { order_id, sender_id, message, reclamation_id } = req.body;

        if (reclamation_id && reclamation_id !== 'undefined' && reclamation_id !== null) {
            // ✅ الكتابة في reclamation_messages
            const result = await pool.query(
                `INSERT INTO reclamation_messages (reclamation_id, sender_id, message_text) 
                 VALUES ($1, $2, $3) RETURNING *`,
                [reclamation_id, sender_id, message]
            );

            // إشعار الأدمين
            const adminId = "78937316-c177-4e94-9a19-b82a0f8cc916";
            await pool.query(
                "INSERT INTO notifications (user_id, reclamation_id, message) VALUES ($1, $2, $3)",
                [adminId, reclamation_id, "New message from a party in the investigation"]
            );

            const senderInfo = await pool.query("SELECT name FROM users WHERE id = $1", [sender_id]);
            return res.json({ ...result.rows[0], sender_name: senderInfo.rows[0].name });

        } else {
            // شات عادي بدون بلاغ — يبقى كما هو في messages
            const { receiver_id } = req.body;
            const result = await pool.query(
                `INSERT INTO messages (order_id, sender_id, receiver_id, message) 
                 VALUES ($1, $2, $3, $4) RETURNING *`,
                [order_id, sender_id, receiver_id, message]
            );
            return res.json(result.rows[0]);
        }

    } catch (err) {
        console.error("❌ SEND ERROR:", err.message);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
});

module.exports = router;