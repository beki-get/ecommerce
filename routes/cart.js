// routes/cart.js
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authenticate = require('../middlewares/auth');

// Cart operations (login required)
router.post('/add', authenticate, cartController.addToCart);
router.get('/cart', authenticate, cartController.getCart);
router.post('/update', authenticate, cartController.updateItemQuantity);
router.post('/item/remove', authenticate, cartController.removeItem);
router.post('/clear', authenticate, cartController.clearCart);

module.exports = router;
