const Cart = require("../Models/Cart");

const addToCart = async (req, res) => {
    try {
        const { productId, quantity, userId } = req.body;

        if (!userId || !productId || !quantity) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        let cartItem = await Cart.findOne({ userId, productId });

        if (cartItem) {
            cartItem.quantity += quantity;
            await cartItem.save();
        } else {
            cartItem = await Cart.create({ userId, productId, quantity });
        }

        res.status(201).json({ message: "Cart updated successfully", cartItem });
    } catch (error) {
        res.status(500).json({ message: "Error adding to cart", error });
    }
};
const getCart = async (req, res) => {   
    try {
        const { userId } = req.params;  
      

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const cart = await Cart.find({ userId }).populate("productId");

        res.status(200).json({ message: "Cart retrieved successfully", cart });
    } catch (error) {
        res.status(500).json({ message: "Error fetching cart", error });
    }
};




module.exports = { addToCart, getCart };
