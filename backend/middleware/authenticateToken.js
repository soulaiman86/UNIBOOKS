const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    // 1. جلب التوكن من الهيدر (Authorization)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // استخراج التوكن بعد كلمة Bearer

    // 2. إذا لم يرسل المستخدم توكن أصلاً
    if (!token) {
        return res.status(401).json({ message: "Access Denied: No Token Provided" });
    }

    // 3. التحقق من صحة التوكن
    jwt.verify(token, 'mySecretKey', (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or Expired Token" });
        }
        
        // 4. إذا كان التوكن سليماً، نخزن بيانات المستخدم (id, role) في الطلب (req)
        req.user = user;
        
        // 5. السماح بالانتقال إلى الوظيفة التالية (المسار المطلوب)
        next();
    });
};

module.exports = authenticateToken;