const express = require('express');
const router = express.Router();
const pool = require('../db');


// 6. مسار جلب الإشعارات لمستخدم معين (أضف هذا المسار لكي يعمل الـ Navbar)
router.get('/notifications/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;
        const notifications = await pool.query(
            "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10",
            [user_id]
        );
        res.json(notifications.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// 1. مسار إرسال شكوى جديدة (يستخدمه المشتري)
router.post('/add', async (req, res) => {
    try {
        const { order_id, buyer_id, seller_id, subject, description } = req.body;

        const newReclamation = await pool.query(
            `INSERT INTO reclamations (order_id, buyer_id, seller_id, subject, description) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [order_id, buyer_id, seller_id, subject, description]
        );

        res.status(201).json({
            message: "Reclamation sent successfully to admin!",
            reclamation: newReclamation.rows[0]
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

// 2. مسار جلب جميع الشكاوى (خاص بالآدمين)
router.get('/admin/all', async (req, res) => {
    try {
        const allReclamations = await pool.query(`
            SELECT r.*, 
                   u1.name as buyer_name, 
                   u2.name as seller_name,
                   u2.profile_image as seller_image 
            FROM reclamations r
            JOIN users u1 ON r.buyer_id = u1.id
            JOIN users u2 ON r.seller_id = u2.id
            ORDER BY r.created_at DESC
        `);
        res.json(allReclamations.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

// 3. مسار تحديث حالة الشكوى وإرسال إشعار بالحل
router.put('/admin/update-status/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updated = await pool.query(
            "UPDATE reclamations SET status = $1 WHERE id = $2 RETURNING *",
            [status, id]
        );

        const { buyer_id, seller_id } = updated.rows[0];
        const adminId = "78937316-c177-4e94-9a19-b82a0f8cc916";

        // رسائل الحالة
        const statusMessages = {
            'Resolved': '✅ The admin has resolved this complaint. The case is now closed.',
            'Under Review': '⏳ The admin is currently reviewing this complaint. Please wait.',
            'Rejected': '❌ The admin has reviewed and rejected this complaint.'
        };

        const messageText = statusMessages[status] || `The complaint status has been updated to: ${status}`;

        // إرسال رسالة تلقائية في المحادثة
        await pool.query(
            `INSERT INTO reclamation_messages (reclamation_id, sender_id, message_text) 
             VALUES ($1, $2, $3)`,
            [id, adminId, messageText]
        );

        // إرسال إشعار للمشتري والبائع
        await pool.query(
            "INSERT INTO notifications (user_id, reclamation_id, message) VALUES ($1, $2, $3)",
            [buyer_id, id, messageText]
        );
        await pool.query(
            "INSERT INTO notifications (user_id, reclamation_id, message) VALUES ($1, $2, $3)",
            [seller_id, id, messageText]
        );

        res.json({ message: "Status updated", reclamation: updated.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

// 4. جلب الرسائل الخاصة بشكوى معينة
router.get('/messages/:reclamation_id', async (req, res) => {
    try {
        const { reclamation_id } = req.params;
        const messages = await pool.query(
            `SELECT m.*, u.name as sender_name, u.role as sender_role 
             FROM reclamation_messages m 
             JOIN users u ON m.sender_id = u.id 
             WHERE m.reclamation_id = $1 
             ORDER BY m.created_at ASC`,
            [reclamation_id]
        );
        res.json(messages.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

// 5. إرسال رسالة جديدة (مع إرسال إشعارات للأطراف)
router.post('/messages/add', async (req, res) => {
    const { reclamation_id, sender_id, message_text } = req.body;
    
    try {
        // 1. إدخال الرسالة
        const newMessage = await pool.query(
            `INSERT INTO reclamation_messages (reclamation_id, sender_id, message_text) 
             VALUES ($1, $2, $3) RETURNING *`,
            [reclamation_id, sender_id, message_text]
        );

        // 2. جلب أطراف الشكوى ( buyer_id و seller_id)
        const recResult = await pool.query(
            `SELECT buyer_id, seller_id FROM reclamations WHERE id = $1`, 
            [reclamation_id]
        );
        
        const { buyer_id, seller_id } = recResult.rows[0];

        // 3. إرسال إشعارات (فقط إذا كان المرسل هو الآدمن)
        // يمكنك إضافة شرط التحقق من role المرسل هنا إذا أردت
        const notifyMsg = "New message from Admin regarding your investigation";
        
        await pool.query(
            "INSERT INTO notifications (user_id, reclamation_id, message) VALUES ($1, $2, $3)",
            [buyer_id, reclamation_id, notifyMsg]
        );
        await pool.query(
            "INSERT INTO notifications (user_id, reclamation_id, message) VALUES ($1, $2, $3)",
            [seller_id, reclamation_id, notifyMsg]
        );

        // جلب اسم المرسل للفرونت إند
        const senderInfo = await pool.query("SELECT name FROM users WHERE id = $1", [sender_id]);

        res.json({ 
            ...newMessage.rows[0], 
            sender_name: senderInfo.rows[0].name 
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
});



// 7. تحديث الإشعار كمقروء
router.put('/notifications/read/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = $1', [id]);
        res.status(200).send("Notification updated");
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;