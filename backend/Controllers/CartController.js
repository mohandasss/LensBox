const Cart = require("../Models/Cart");

const addToCart = async (req, res) => {
    const { productId, quantity } = req.body;
    const cart = await Cart.create({ productId, quantity });
    res.status(201).json({ message: "Cart created successfully", cart });
}

const getCart = async (req, res) => {
    const cart = await Cart.find();
    res.status(200).json({ message: "Cart found", cart });
}


module.exports = { addToCart, getCart };
