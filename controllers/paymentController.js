const axios = require('axios');
const Order = require('../models/Order');

// Initialize Chapa Payment
exports.initializeChapaPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId).populate('userId', 'email name');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Generate unique transaction reference
    const tx_ref = `tx-${order._id}-${Date.now()}`;
    const frontendUrl=process.env.NODE_ENV === 'production' 
           ? process.env.CLIENT_URL
           : process.env.FRONTEND_URL;
    const backendUrl=process.env.NODE_ENV === 'production' 
           ? process.env.BACKEND_LIVE 
           : process.env.BACKEND_URL;
    const chapaPayload = {
      amount: order.totalAmount,
      currency: 'ETB',
      email: order.userId?.email || 'customer@example.com',
      first_name: order.userId?.name || 'Customer',
      tx_ref: tx_ref,
      callback_url: `${backendUrl}/api/payment/webhook`,
      return_url: `${frontendUrl}/order-success?orderId=${order._id}`,
      customization: {
        title: 'Order Payment',
        description: `Payment for Order ${order._id}`
      }
    };

    const response = await axios.post(
      'https://api.chapa.co/v1/transaction/initialize',
      chapaPayload,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.status === 'success') {
      res.json({ checkout_url: response.data.data.checkout_url });
    } else {
      res.status(400).json({ message: 'Failed to initialize payment with Chapa' });
    }

  } catch (err) {
    console.error('Chapa Init Error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Payment initialization failed', error: err.message });
  }
};

// Chapa Webhook Listener (Called directly by Chapa)
exports.chapaWebhook = async (req, res) => {
  try {
    const event = req.body;

    // Verify transaction status from webhook payload
    if (event && event.status === 'success') {
      // Extract original order ID from tx_ref (format: tx-ORDERID-TIMESTAMP)
      const tx_ref = event.tx_ref;
      const orderId = tx_ref.split('-')[1];

      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: 'paid',
          status: 'processing'
        });
        console.log(`Order ${orderId} marked as PAID via Chapa Webhook`);
      }
    }

    // Always send 200 back to Chapa so they know the webhook was received
    res.status(200).send('Webhook processed');
  } catch (err) {
    console.error('Chapa Webhook Error:', err);
    res.status(500).send('Webhook Error');
  }
};