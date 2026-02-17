const express = require('express');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Order Schema
const orderSchema = new mongoose.Schema({
  amount: Number,
  currency: String,
  receipt: String,
  status: { type: String, default: 'created' },
  paymentId: String,
  items: Array, // simplified for now
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// Razorpay Instance
// Note: You must provide RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder', 
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder'
});

// Routes

// 1. Create Order
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, currency, items } = req.body;
    
    const options = {
      amount: amount * 100, // amount in paisa
      currency: currency || "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    
    if (!order) return res.status(500).send("Some error occured");

    // Save initial order to DB
    const newOrder = new Order({
      amount: amount,
      currency: options.currency,
      receipt: options.receipt,
      status: 'created',
      items: items
    });
    await newOrder.save();

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// 2. Verify Payment
app.post('/api/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder');
    
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');
    
    if (generated_signature === razorpay_signature) {
      // Payment is successful
      // Update order in DB
      // Note: In a real app, you would find the order by razorpay_order_id (if you stored it) 
      // or receipt. For simplicity, we are just logging success here.
      
      // Example: await Order.findOneAndUpdate({ receipt: ... }, { status: 'paid', paymentId: razorpay_payment_id });
      
      res.json({ status: 'success', message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ status: 'failure', message: 'Invalid signature' });
    }
  } catch (error) {
     console.error(error);
     res.status(500).send(error);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
