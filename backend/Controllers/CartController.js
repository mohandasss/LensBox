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

   const updateCart = async (req, res) => {
    try {
        const { userId, productId } = req.params;
        const { quantity } = req.body;

        if (!userId || !productId || quantity == null) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const cartItem = await Cart.findOne({ userId, productId });

        if (!cartItem) {
            return res.status(404).json({ message: "Cart item not found" });
        }

        cartItem.quantity = quantity;
        await cartItem.save();

        res.status(200).json({ message: "Cart item updated successfully", cartItem });
    } catch (error) {
        res.status(500).json({ message: "Error updating cart item", error });
    }
};

const deleteCartItem = async (req, res) => {
    try {
        const { userId, productId } = req.params;

        const cartItem = await Cart.findOneAndDelete({ userId, productId });
        console.log(cartItem);
        
        if (!cartItem) {
            return res.status(404).json({ message: "Cart item not found" });
        }

        res.status(200).json({ message: "Cart item deleted successfully", cartItem });

    } catch (error) {
        res.status(500).json({ message: "Error deleting cart item", error });
    }
};

const clearCart = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const result = await Cart.deleteMany({ userId });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "No cart items found for this user" });
        }

        res.status(200).json({ 
            message: `Successfully cleared ${result.deletedCount} items from cart`,
            deletedCount: result.deletedCount
        });

    } catch (error) {
        res.status(500).json({ message: "Error clearing cart", error });
    }
};

module.exports = { 
    addToCart,
    updateCart, 
    getCart, 
    deleteCartItem, 
    clearCart 
};
