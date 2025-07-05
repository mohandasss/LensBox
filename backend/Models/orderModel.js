const mongoose = require('mongoose');
    

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  customerDetails: {
    fullName: String,
    phone: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
  },
  status: {
    type: String,
    enum: ['confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'confirmed'
  },
  startDate: Date,
  endDate: Date,

  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: Number,
      amount: Number,
    },
  ],

  total: Number,

  razorpay: {
    orderId: String,
    paymentId: String,
    signature: String,
  },

}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
