const express = require('express');
const router = express.Router();
const pool = require('../db');

// إضافة كتاب إلى السلة
router.post('/add', async (req, res) => {
    try {
        const { user_id, book_id } = req.body;

        // محاولة إدخال الكتاب في السلة
        // استخدام ON CONFLICT للتعامل مع الحالة التي يكون فيها الكتاب مضافاً مسبقاً
        const newItem = await pool.query(
            `INSERT INTO cart (user_id, book_id) 
             VALUES ($1, $2) 
             ON CONFLICT (user_id, book_id) 
             DO UPDATE SET quantity = cart.quantity + 1 
             RETURNING *`,
            [user_id, book_id]
        );

        res.json({ message: "Book added to database cart!", item: newItem.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});
// جلب عدد الكتب في السلة لمستخدم معين
router.get('/count/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;
        const count = await pool.query(
            'SELECT SUM(quantity) FROM cart WHERE user_id = $1',
            [user_id]
        );
        res.json({ count: parseInt(count.rows[0].sum) || 0 });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});
// جلب تفاصيل الكتب في السلة لمستخدم معين
router.get('/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;
        
        // هنا نستخدم JOIN لجلب بيانات الكتاب من جدول الكتب بناءً على book_id الموجود في السلة
        const cartItems = await pool.query(
            `SELECT cart.id AS cart_item_id, books.id AS book_id, books.title, books.price, books.image_urls, cart.quantity 
             FROM cart 
             JOIN books ON cart.book_id = books.id 
             WHERE cart.user_id = $1`,
            [user_id]
        );

        res.json(cartItems.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});
// حذف كتاب معين من السلة
router.delete('/:cart_item_id', async (req, res) => {
    try {
        const { cart_item_id } = req.params;
        
        await pool.query('DELETE FROM cart WHERE id = $1', [cart_item_id]);

        res.json({ message: "Item removed from cart" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});
// تحديث الكمية (زيادة أو نقصان)

router.put('/update-quantity', async (req, res) => {
    try {
        const { cart_item_id, action } = req.body;

        // 1. جلب البيانات والتأكد من وجود العنصر
        const data = await pool.query(
            `SELECT cart.quantity, books.stock 
             FROM cart 
             JOIN books ON cart.book_id = books.id 
             WHERE cart.id = $1`, 
            [cart_item_id]
        );

        if (data.rows.length === 0) {
            return res.status(404).json({ message: "Item not found" });
        }

        const { quantity, stock } = data.rows[0];

        if (action === 'increment') {
            // التحقق الصارم: هل وصلنا للحد الأقصى؟
            if (quantity >= stock) {
                // ضروري جداً وضع return هنا لمنع أي تحديث
                return res.status(400).json({ message: `Sorry, only ${stock} items available in stock` });
            }
            
            await pool.query('UPDATE cart SET quantity = quantity + 1 WHERE id = $1', [cart_item_id]);
            return res.json({ message: "Quantity increased" });

        } else if (action === 'decrement') {
            if (quantity > 1) {
                await pool.query('UPDATE cart SET quantity = quantity - 1 WHERE id = $1', [cart_item_id]);
                return res.json({ message: "Quantity decreased" });
            } else {
                return res.status(400).json({ message: "Minimum quantity is 1" });
            }
        }

    } catch (err) {
        console.error(err.message);
        return res.status(500).send("Server Error");
    }
});
router.get('/user/:user_id/book/:book_id', async (req, res) => {
    try {
        const { user_id, book_id } = req.params;
        const result = await pool.query(
            'SELECT quantity FROM cart WHERE user_id = $1 AND book_id = $2', 
            [user_id, book_id]
        );
        res.json({ quantity: result.rows[0]?.quantity || 0 });
    } catch (err) {
        res.status(500).send("Server Error");
    }
});
module.exports = router;