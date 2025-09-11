// controllers/authController.js
const User = require('../models/User'); // ✅ fix case-sensitive import
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// (optional) safely require Cart if it exists, so guest-cart merge won't crash
let Cart = null;
try { Cart = require('../models/cart'); } catch (_) {}

const signJwt = (user) =>
  jwt.sign({ userId: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '1d' });

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email, and password are required' });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const user = new User({ name, email, password });

    // Email verification token
    const token = crypto.randomBytes(20).toString('hex');
    user.emailVerificationToken = token;
    user.emailVerificationExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    const verificationUrl = `${process.env.CLIENT_URL || 'https://ecommerce-frontend-9kyz.onrender.com'}/verify-email/${token}`;

    await sendEmail({
      to: user.email,
      subject: 'Email Verification',
      text: `Please verify your email by clicking the link: ${verificationUrl}`,
    });

    res.status(201).json({ message: 'User registered. Please verify your email.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password, guestCart = [] } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    if (!user.isVerified) {
      return res.status(401).json({ message: 'Please verify your email before logging in.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // --- SAFE MERGE GUEST CART (only if Cart model exists) ---
    if (Array.isArray(guestCart) && guestCart.length > 0 && Cart) {
      let userCart = await Cart.findOne({ userId: user._id });
      if (!userCart) userCart = new Cart({ userId: user._id, products: [] });

      guestCart.forEach((guestItem) => {
        const existingItem = userCart.products.find(
          (p) => p.productId?.toString() === guestItem.productId
        );
        if (existingItem) {
          existingItem.quantity += guestItem.quantity;
        } else {
          userCart.products.push({
            productId: guestItem.productId,
            quantity: guestItem.quantity,
          });
        }
      });

      await userCart.save();
    }
    // ---------------------------------------------------------

    const token = signJwt(user);

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Verify Email
exports.verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({
      emailVerificationToken: req.params.token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    res.json({ message: 'Email has been successfully verified' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No user found with that email' });

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL || 'https://ecommerce-frontend-9kyz.onrender.com'}/reset-password/${token}`;

    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click here to reset your password: ${resetUrl}`
    });

    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.password = req.body.password; // hashed by pre-save
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
