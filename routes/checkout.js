
//routes/checkout.js
const express = require('express');
const router = express.Router();
const {authenticate} = require('../middlewares/auth');
const { checkout } = require('../controllers/checkoutController');

router.post('/', authenticate, checkout);

module.exports = router;
