const router = require("express").Router();
const { registerUser, loginUser, checkAuth } = require("../Controllers/AuthController");
const { authMiddleware } = require("../middlewares/AuthMiddleware");


router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/check", authMiddleware, checkAuth);

module.exports = router;
