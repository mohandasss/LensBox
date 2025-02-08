const router = require("express").Router();
const { registerUser, loginUser, logoutUser, checkAuth } = require("../Controllers/AuthController");

const { authMiddleware } = require("../middlewares/AuthMiddleware");


router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", authMiddleware, logoutUser);
router.get("/check", checkAuth);
module.exports = router;

