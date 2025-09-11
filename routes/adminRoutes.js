// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');

// dashboard stats
router.get('/stats', auth, admin, adminController.getStats);

// users
router.get('/users', auth, admin, adminController.getUsers);
router.delete('/users/:id', auth, admin, adminController.deleteUser);

// products management
router.get('/products', auth, admin, adminController.getProducts);
router.post('/products', auth, admin, adminController.createProduct);
router.put('/products/:id', auth, admin, adminController.updateProduct);
router.delete('/products/:id', auth, admin, adminController.deleteProduct);
router.patch('/products/:id', auth, admin, adminController.updateProduct);

// orders management
router.get('/orders', auth, admin, adminController.getOrders);
router.put('/orders/:id/status', auth, admin, adminController.updateOrderStatus);
router.put('/orders/:id/payment-status', auth, admin, adminController.updatePaymentStatus);
router.delete('/orders/:id', auth, admin, adminController.deleteOrder);
module.exports = router;
