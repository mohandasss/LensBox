const mongoose = require('mongoose');

const TempOrderSchema = new mongoose.Schema({
  razorpayOrderId: { type: String, required: true, unique: true },
  orderData: { type: Object, required: true },
}, { timestamps: true });

module.exports = mongoose.model('TempOrder', TempOrderSchema);
