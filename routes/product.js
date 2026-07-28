
// routes/product.js
const express = require('express');
const router = express.Router();
const {authenticate }= require("../middlewares/auth");   
const admin= require("../middlewares/admin");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

console.log("Type of auth:", typeof auth);
console.log("Type of admin:", typeof admin);
console.log("Type of createProduct:", typeof createProduct);

router.post('/', authenticate, admin, createProduct);

// Create product (protected + admin only)
router.post('/', authenticate, admin, createProduct);

// Read all
router.get('/', getProducts);

// Read one
router.get('/:id', getProductById);

// Update
router.put('/:id', authenticate, admin, updateProduct);

// Delete
router.delete('/:id', authenticate, admin, deleteProduct);

module.exports = router;
