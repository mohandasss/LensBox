const mongoose = require('mongoose');

const stockNotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  email: {
    type: String,
    required: true
  },
  isNotified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  notifiedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate notifications for same user and product
stockNotificationSchema.index({ userId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model('StockNotification', stockNotificationSchema); 