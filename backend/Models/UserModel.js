const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema({
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, required: true }
}, { _id: false });

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: AddressSchema, required: true },
    role: { type: String, enum: ['user', 'seller'], default: 'user' },
    phone: { type: String, required: true },
}, { timestamps: true }); // Use `timestamps` option to automatically handle createdAt and updatedAt
 // Use `timestamps` option to automatically handle createdAt and updatedAt

module.exports = mongoose.model("User", UserSchema);
