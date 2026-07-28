// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const {authenticate} = require('../middlewares/auth');
const admin = require('../middlewares/admin');

// dashboard stats
router.get('/stats', authenticate, admin, adminController.getStats);

// users
router.get('/users', authenticate, admin, adminController.getUsers);
router.delete('/users/:id', authenticate, admin, adminController.deleteUser);

// products management
router.get('/products', authenticate, admin, adminController.getProducts);
router.post('/products', authenticate, admin, adminController.createProduct);
router.put('/products/:id', authenticate, admin, adminController.updateProduct);
router.delete('/products/:id', authenticate, admin, adminController.deleteProduct);
router.patch('/products/:id', authenticate, admin, adminController.updateProduct);

// orders management
router.get('/orders', authenticate, admin, adminController.getOrders);
router.put('/orders/:id/status', authenticate, admin, adminController.updateOrderStatus);
router.put('/orders/:id/payment-status', authenticate, admin, adminController.updatePaymentStatus);
router.delete('/orders/:id', authenticate, admin, adminController.deleteOrder);
module.exports = router;
