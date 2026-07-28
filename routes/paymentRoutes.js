const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { initializeChapaPayment, chapaWebhook } = require('../controllers/paymentController');

// Route 1: User requests payment link
router.post('/initialize', authenticate, initializeChapaPayment);

// Route 2: Chapa calls this when payment succeeds
router.post('/webhook', chapaWebhook);

module.exports = router;