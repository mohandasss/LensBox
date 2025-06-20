const router = require("express").Router();
const { registerUser, loginUser,deleteUser, checkAuth,updateUser } = require("../Controllers/AuthController");
const { authMiddleware } = require("../middlewares/AuthMiddleware");


router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/check", authMiddleware, checkAuth);
router.put("/updateprofile", authMiddleware, updateUser);
router.delete("/deleteuser/:userId", deleteUser);
module.exports = router;
