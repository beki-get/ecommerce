// backend/app.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/product');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orderRoutes');
const checkoutRoutes = require('./routes/checkout');
//const paymentRoutes = require('./routes/paymentRoutes'); // Import payment routes
const adminRoutes = require("./routes/adminRoutes");



// Config

dotenv.config();
const app = express();


// Middleware
app.use(cors({
  origin: "https://ecommerce-frontend-9kyz.onrender.com", // React app URL
  credentials: true, // if you need cookies
}));
app.use(express.json());

/*app.get('/api/cart', (req, res) => {
  // Your cart logic here
  res.json({ items: [] });
});*/

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use("/api/orders", orderRoutes);
app.use('/api/checkout', checkoutRoutes);
//app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
//app.use('/api/payment', paymentRoute);


// Basic route
app.get('/', (req, res) => {
  res.send('Welcome to the Mini eCommerce API!');
});


//frontend CORS configuration
app.use(cors({
  origin: "https://ecommerce-frontend-9kyz.onrender.com", // React frontend URL
  credentials: true
}));




// MongoDB Connection
if (!process.env.MONGO_URI) {
  console.error('MONGO_URI not set in .env file');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
module.exports = app; // Export app for testing
