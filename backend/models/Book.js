const pool = require('../db');

const Book = {
  findAll: async () => {
    const res = await pool.query('SELECT * FROM books ORDER BY created_at DESC');
    return res.rows;
  },

  create: async (bookData) => {
    // استخراج البيانات بناءً على أسماء الأعمدة في الصورة
    const { seller_id, title, description, price, category, image_urls } = bookData;
    
    const query = `
      INSERT INTO books (seller_id, title, description, price, category, image_urls)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`;
      
    // ملاحظة: image_urls في PostgreSQL كـ text[] تحتاج أن تُرسل كمصفوفة ['url1']
    const values = [
      seller_id, 
      title, 
      description, 
      price, 
      category, 
      image_urls || [] // مصفوفة فارغة كقيمة افتراضية
    ];

    const res = await pool.query(query, values);
    return res.rows[0];
  }
};

module.exports = Book;