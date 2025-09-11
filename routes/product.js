
// routes/product.js
const express = require('express');
const router = express.Router();
const auth = require("../middlewares/auth");   
const admin = require("../middlewares/admin");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

// Create product (protected + admin only)
router.post('/', auth, admin, createProduct);

// Read all
router.get('/', getProducts);

// Read one
router.get('/:id', getProductById);

// Update
router.put('/:id', auth, admin, updateProduct);

// Delete
router.delete('/:id', auth, admin, deleteProduct);

module.exports = router;
