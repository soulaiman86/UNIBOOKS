require('dotenv').config();
console.log("Environment check:", process.env.DB_PASSWORD);
const express = require('express');
const cors = require('cors');
const path = require('path');
const userRouter = require('./routes/userRoutes');
const bookRoutes = require('./routes/bookRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/books', bookRoutes);
app.use('/api/users', userRouter);

app.get('/', (req, res) => {
  res.send('The bookstore server is working successfully!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 The server is working on the port ${PORT}`);
});

