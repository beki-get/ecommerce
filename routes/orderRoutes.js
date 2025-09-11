//routes/orderRoutes.js
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Order = require("../models/Order");
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");

// Place an order (authenticated user)
router.post("/", auth, async (req, res) => {
  try {
    const { products, totalAmount } = req.body;

    const order = new Order({
      userId: req.user.id,
      products,
      totalAmount
    });

    await order.save();
    res.status(201).json(order);
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get logged-in user's orders
router.get("/my-orders", auth, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const orders = await Order.find({ userId }).populate({"path": "products.productId",select:"name"}) ;
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all orders (admin only) with pagination
router.get("/all", auth, admin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalOrders = await Order.countDocuments();
    const orders = await Order.find()
      .populate("products.productId")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      totalOrders,
      page,
      totalPages: Math.ceil(totalOrders / limit),
      orders,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update order status (admin only)
router.put("/:orderId/status", auth, admin, async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const validStatuses = ["pending", "shipped", "delivered", "cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid order status" });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Cancel order by user (only if pending)
router.put("/:orderId/cancel", auth, async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to cancel this order" });
    }

    if (order.status !== "pending") {
      return res.status(400).json({ message: "Only pending orders can be cancelled" });
    }

    order.status = "cancelled";
    await order.save();

    res.json({ message: "Order cancelled successfully", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update payment status (admin only)
router.put("/:orderId/payment-status", auth, admin, async (req, res) => {
  const { orderId } = req.params;
  const { paymentStatus } = req.body;

  const validPaymentStatuses = ["pending", "paid", "failed"];
  if (!validPaymentStatuses.includes(paymentStatus)) {
    return res.status(400).json({ message: "Invalid payment status" });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.paymentStatus = paymentStatus;
    await order.save();

    res.json({ message: "Payment status updated", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
