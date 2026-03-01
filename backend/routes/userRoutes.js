const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// مسار تسجيل مستخدم جديد
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // 1. تشفير كلمة المرور
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 2. إدخال المستخدم بكلمة المرور المشفرة
        const newUser = await pool.query(
            "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role",
            [name, email, hashedPassword, role]
        );

        res.json({ message: "The user has been successfully registered!", user: newUser.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. التأكد من وجود المستخدم
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        
        if (user.rows.length === 0) {
            return res.status(401).json({ error: "Incorrect email address or password" });
        }

        // 2. مقارنة كلمة المرور
        const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
        
        if (!validPassword) {
            return res.status(401).json({ error: "Incorrect email address or password" });
        }

        // 3. إنشاء التوكن (JWT)
        // سنستخدم 'mySecretKey' مؤقتاً، في الواقع نضعها في ملف .env
        const token = jwt.sign(
            { id: user.rows[0].id, role: user.rows[0].role },
            process.env.JWT_SECRET || 'mySecretKey',
            { expiresIn: '24h' }
        );

        // 4. إرسال الرد
        res.json({
            message: "Login successful!",
            token,
            user: {
                id: user.rows[0].id,
                name: user.rows[0].name,
                role: user.rows[0].role
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;