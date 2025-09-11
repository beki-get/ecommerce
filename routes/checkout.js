
//routes/checkout.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth');
const { checkout } = require('../controllers/checkoutController');

router.post('/', verifyToken, checkout);

module.exports = router;
