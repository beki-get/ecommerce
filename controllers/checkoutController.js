const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Product = require('../models/Product');

exports.checkout = async (req, res) => {
  try {
    // Standardized user ID fallback
    const userId = req.user.id || req.user._id;
    const { items, address, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    let totalAmount = 0;
    const orderProducts = [];

    // Process each item: validate stock, calculate total, deduct stock
    for (const item of items) {
      const product = await Product.findById(item.productId);
      const quantity = Number(item.quantity) || 1;

      if (!product) {
        return res.status(400).json({ message: `Product not found: ${item.productId}` });
      }

      if (quantity > product.countInStock) {
        return res.status(400).json({
          message: `Not enough stock for ${product.name}. Available: ${product.countInStock}`
        });
      }

      // Deduct stock
      product.countInStock -= quantity;
      await product.save();

      const price = product.price || 0;
      totalAmount += price * quantity;

      orderProducts.push({
        productId: product._id,
        quantity: quantity,
        price: price
      });
    }

    // Create the order
    const order = new Order({
      userId: userId,
      products: orderProducts,
      totalAmount: totalAmount,
      status: 'pending',
      paymentStatus: 'pending',
      address: address,
      paymentMethod: paymentMethod || 'cod'
    });

    const savedOrder = await order.save();

    // Clear user cart
    await Cart.deleteOne({ userId });

    res.status(201).json({
      message: 'Order created successfully',
      order: savedOrder
    });

  } catch (err) {
    console.error('Checkout Error:', err);
    res.status(500).json({ message: 'Checkout failed', error: err.message });
  }
};

// Get logged-in user's orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
    .populate('products.productId', 'name price').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all orders (Admin only)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single order (Admin or owner)
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('userId', 'name email');
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (!req.user.isAdmin && order.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



    

  

