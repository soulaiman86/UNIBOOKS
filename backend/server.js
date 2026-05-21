require('dotenv').config();
console.log("Environment check:", process.env.DB_PASSWORD);
const express = require('express');
const cors = require('cors');
const path = require('path');
const userRouter = require('./routes/userRoutes');
const bookRoutes = require('./routes/bookRoutes');
const cartRoutes = require('./routes/cartRoutes');
const chatRoutes = require('./routes/chatRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const reclamationRoutes = require('./routes/reclamationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');



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

app.use('/api/cart', cartRoutes);

const orderRoutes = require('./routes/orderRoutes');
app.use('/api/orders', orderRoutes);

app.use('/api/chat', chatRoutes);

app.use('/api/reviews', reviewRoutes);

app.use('/api/reclamations', reclamationRoutes);

app.use('/api/admin', adminRoutes);

app.use('/api/seller', sellerRoutes);

app.use('/api/chatbot', chatbotRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT,'0.0.0.0', () => {
  console.log(`🚀 The server is working on the port ${PORT}`);
});

