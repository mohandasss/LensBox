const mongoose = require("mongoose");

const SubscribersSchema = new mongoose.Schema({
    
    email: { type: String, required: true },
    isSubscribed: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("Subscribers", SubscribersSchema);
