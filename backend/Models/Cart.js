const mongoose = require("mongoose");
const User = require("./UserModel");
const Product = require("./Products");

const cartSchema = new mongoose.Schema({

    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    quantity: { type: Number, default: 1 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

});

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
