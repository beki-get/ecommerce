const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Order = require("../models/Order");
const { authenticate } = require("../middlewares/auth");
const admin = require("../middlewares/admin");

// Get logged-in user's orders
router.get("/my-orders", authenticate, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const orders = await Order.find({ userId })
      .populate("products.productId", "name price")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single order by ID
router.get("/:id", authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("products.productId", "name price");
    if (!order) return res.status(404).json({ message: "Order not found" });

    const currentUserId = (req.user.id || req.user._id).toString();
    if (order.userId.toString() !== currentUserId && !req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Get all orders (admin only) with pagination
router.get("/all", authenticate, admin, async (req, res) => {
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
router.put("/:orderId/status", authenticate, admin, async (req, res) => {
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
router.put("/:orderId/cancel", authenticate, async (req, res) => {
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
router.put("/:orderId/payment-status", authenticate, admin, async (req, res) => {
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
