const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // React app default ports
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// API Routes mounting
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));

// Welcome/Status endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Chào mừng bạn đến với E-Commerce Customer Backend API!',
    documentation: 'Sử dụng các endpoint /api/auth, /api/products, /api/cart, /api/orders'
  });
});

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Không tìm thấy endpoint được yêu cầu' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Lỗi hệ thống:', err.stack);
  res.status(500).json({ message: 'Đã xảy ra lỗi hệ thống nghiêm trọng' });
});

// Start Server
app.listen(PORT, () => {
  console.log('==================================================');
  console.log(`🚀 BACKEND SERVER RUNNING AT: http://localhost:${PORT}`);
  console.log('==================================================');
});

