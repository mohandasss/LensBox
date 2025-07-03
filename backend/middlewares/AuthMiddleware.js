const jwt = require("jsonwebtoken");
const User = require("../Models/UserModel");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; // Extract token
  

  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Store user info in req.user
      next();
  } catch (error) {
      console.error("JWT Verification Error:", error);
      return res.status(401).json({ message: "Invalid or expired token" });
  }
};

const isAdmin = (req, res, next) => {
  const user = User.findById(req.userId);
  if (!user) {  
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (user.role !== "admin") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  
  next();
};

const isSeller = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {  
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (user.role !== "seller") {
      return res.status(403).json({ message: "Access denied. Seller role required." });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

// Export the middleware functions
module.exports = {
  protect: authMiddleware,
  isAdmin,
  isSeller,
  authMiddleware // Keep both for backward compatibility
};
