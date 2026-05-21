const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- إعدادات رفع صور البروفايل ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/profiles';
        // إنشاء المجلد إذا لم يكن موجوداً
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // تسمية الصورة بـ timestamp + الاسم الأصلي لتفادي تكرار الأسماء
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// مسار تسجيل مستخدم جديد
// أضفنا upload.single لاستقبال ملف الصورة من الحقل المسمى 'profile_image'
router.post('/register', upload.single('profile_image'), async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        // جلب مسار الصورة إذا تم رفعها، وإلا نضع null
        const profileImagePath = req.file ? `/uploads/profiles/${req.file.filename}` : null;

        // 1. تشفير كلمة المرور
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 2. إدخال المستخدم مع الصورة (العمود الجديد profile_image)
        const newUser = await pool.query(
            "INSERT INTO users (name, email, password_hash, role, profile_image) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, profile_image",
            [name, email, hashedPassword, role, profileImagePath]
        );

        res.json({ 
            message: "The user has been successfully registered!", 
            user: newUser.rows[0] 
        });
    } catch (err) {
        console.error("Register Error:", err.message);
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
        const token = jwt.sign(
            { id: user.rows[0].id, role: user.rows[0].role },
            process.env.JWT_SECRET || 'mySecretKey',
            { expiresIn: '24h' }
        );

        // 4. إرسال الرد (أضفنا الصورة الشخصية في الرد ليتمكن الفرونت من تخزينها)
        res.json({
            message: "Login successful!",
            token,
            user: {
                id: user.rows[0].id,
                name: user.rows[0].name,
                role: user.rows[0].role,
                profile_image: user.rows[0].profile_image // جلب الصورة عند تسجيل الدخول
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;