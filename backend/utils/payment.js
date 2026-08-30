// Payment & invoicing utility — Razorpay stub (swap keys/gateway as needed)
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'stub_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'stub_secret',
});

// Creates a payment order for a booking amount (in smallest currency unit, e.g. paise)
const createPaymentOrder = async (amount, currency = 'INR') => {
  try {
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency,
      receipt: `receipt_${Date.now()}`,
    });
    return order;
  } catch (err) {
    // In dev without real keys, return a mock order so the flow still works
    console.warn('Payment gateway not configured, returning mock order:', err.message);
    return { id: `mock_order_${Date.now()}`, amount: amount * 100, currency, status: 'created' };
  }
};

// Generates a simple invoice number
const generateInvoiceNumber = () => `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

module.exports = { createPaymentOrder, generateInvoiceNumber };