const router = require("express").Router();
const { registerUser, loginUser, logoutUser } = require("../Controllers/AuthController");
const { authMiddleware } = require("../middlewares/AuthMiddleware");


router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", authMiddleware, logoutUser);

module.exports = router;

