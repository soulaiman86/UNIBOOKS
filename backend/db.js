const { Pool } = require('pg');
require('dotenv').config();

// إعداد الاتصال باستخدام البيانات من ملف .env
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// اختبار الاتصال
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error connecting to the database:', err.stack);
  }
  console.log('✅The UNIBOOKSDB database connection was successful!');
  release();
});

module.exports = pool;