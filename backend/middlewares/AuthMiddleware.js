const jwt = require("jsonwebtoken");
const User = require("../Models/UserModel");
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; // Extract token
  console.log("Extracted Token:", token); // Debugging

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

module.exports = { authMiddleware, isAdmin };
