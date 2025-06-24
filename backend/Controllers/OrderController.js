const orders = require("../Models/orderModel");

const getAllOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("User ID:", userId);

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const ordersList = await orders
      .find({ user: userId }) // ✅ fixed field
      .populate("items.productId"); // ✅ populate product details inside items
    console.log(ordersList);
    
    res.status(200).json({
      message: "Orders retrieved successfully",
      orders: ordersList,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Error fetching orders", error });
  }
};

module.exports = { getAllOrders };
