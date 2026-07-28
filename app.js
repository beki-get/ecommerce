require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/product');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orderRoutes');
const checkoutRoutes = require('./routes/checkout');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// 1. Middleware (CORS MUST come before routes)
app.use(cors({
  origin: "https://ecommerce-frontend-9kyz.onrender.com", // React app URL
  credentials: true,
}));

app.use(express.json());

// 2. Basic root route
app.get('/', (req, res) => {
  res.send('Welcome to the Mini eCommerce API!');
});

// 3. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/admin', adminRoutes);

// 4. Start Server ONLY after MongoDB Connects successfully
const PORT = process.env.PORT || 5000;

if (!process.env.MONGO_URI) {
  console.error('CRITICAL: MONGO_URI is not defined in environment variables!');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    
    // Bind to 0.0.0.0 so Render can expose the port publicly
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = app;