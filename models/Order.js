//models/Order.js

const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
      },
      quantity: { type: Number, default: 1 },
      price: { type: Number, required: true } // Price at the time of order
    }
  ],
  paymentMethod: { type: String, default: "cod" }, // cod, card, paypal
  totalAmount: { type: Number, required: true },
  address: { // ✅ Add address field
    street: String,
    city: String,
    zip: String
  },
  status: { type: String, default: "pending" }, // pending, shipped, delivered
  paymentStatus: {
  type: String,
  enum: ['pending', 'paid', 'failed'],
  default: 'pending',
},

}, { timestamps: true });
module.exports = mongoose.model("Order", orderSchema);