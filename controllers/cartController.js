// cartController.js
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Add or Update Cart Item (login required)
exports.addToCart = async (req, res) => {
  console.log("Incoming body:", req.body);
  const userId = req.user?.id;
  const { productId, quantity } = req.body;

  if (!userId) return res.status(401).json({ error: "User not authenticated" });
  if (!productId) return res.status(400).json({ error: "productId is required" });

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const qty = Number(quantity) || 1;

    // Check stock
    if (!product || product.stock < qty) {
      return res.status(400).json({ error: "Not enough stock available" });
    }

    let cart = await Cart.findOne({ userId });

    if (cart) {
      const itemIndex = cart.products.findIndex(
        item => item.productId.toString() === productId
      );

      if (itemIndex > -1) {
        // Increment by requested qty, but not over stock
        cart.products[itemIndex].quantity = Math.min(
          cart.products[itemIndex].quantity + qty,
          product.countInStock
        );
      } else {
        cart.products.push({ productId, quantity: qty });
      }

      await cart.save();
    } else {
      cart = new Cart({ userId, products: [{ productId, quantity: qty }] });
      await cart.save();
    }

    // Populate and calculate totals
    const populatedCart = await Cart.findOne({ userId }).populate("products.productId");
    const subtotal = populatedCart.products.reduce((sum, p) => {
      return sum + p.quantity * p.productId.price;
    }, 0);

    return res.status(200).json({ products: populatedCart.products, subtotal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get User Cart
exports.getCart = async (req, res) => {
    // Add cache-control headers
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
 
 
 
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "User not authenticated" });

  try {
    const cart = await Cart.findOne({ userId }).populate("products.productId");
    if (!cart) return res.status(200).json({ products: [], subtotal: 0 });

    const subtotal = cart.products.reduce((sum, p) => {
      return sum + p.quantity * p.productId.price;
    }, 0);

    res.status(200).json({ products: cart.products, subtotal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Item Quantity
exports.updateItemQuantity = async (req, res) => {
  const userId = req.user?.id;
  const { productId, quantity } = req.body;

  if (!userId) return res.status(401).json({ error: "User not authenticated" });
  if (!productId) return res.status(400).json({ error: "productId is required" });

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    let cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemIndex = cart.products.findIndex(
      item => item.productId.toString() === productId
    );

    if (itemIndex > -1) {
      cart.products[itemIndex].quantity = Math.min(quantity, product.countInStock);
      await cart.save();
    }

    const populatedCart = await Cart.findOne({ userId }).populate("products.productId");
    const subtotal = populatedCart.products.reduce((sum, p) => {
      return sum + p.quantity * p.productId.price;
    }, 0);

    res.json({ products: populatedCart.products, subtotal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Remove Item
exports.removeItem = async (req, res) => {
  const userId = req.user?.id;
  const { productId } = req.body;
  if (!userId) return res.status(401).json({ error: "User not authenticated" });
  if (!productId) return res.status(400).json({ error: "productId is required" });

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.products = cart.products.filter(
      item => item.productId.toString() !== productId
    );

    await cart.save();

    // Return updated cart
    const populatedCart = await Cart.findOne({ userId }).populate("products.productId");
    const subtotal = populatedCart.products.reduce((sum, p) => {
      return sum + p.quantity * p.productId.price;
    }, 0);

    res.json({ products: populatedCart.products, subtotal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Clear Cart
exports.clearCart = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "User not authenticated" });

  try {
    await Cart.findOneAndUpdate({ userId }, { products: [] });
    res.json({ products: [], subtotal: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};