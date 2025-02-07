const jwt = require("jsonwebtoken");
const User = require("../Models/UserModel");
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.userId = decoded.userId;
  next();

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
