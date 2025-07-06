const router = require("express").Router();
const { registerUser , googleCallback, loginUser,deleteUser, checkAuth,updateUser,uploadAvatar,
  requestRegisterOtp, verifyRegisterOtp, requestForgotOtp, verifyForgotOtp, resetPassword } = require("../Controllers/AuthController");
const { authMiddleware } = require("../middlewares/AuthMiddleware");


router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/check", authMiddleware, checkAuth);
router.put("/updateprofile", authMiddleware, updateUser);
router.delete("/deleteuser/:userId", deleteUser);
router.get("/auth/google/callback", googleCallback);
router.put("/uploadavatar", authMiddleware, uploadAvatar);
router.post("/register/request-otp", requestRegisterOtp);
router.post("/register/verify-otp", verifyRegisterOtp);
router.post("/forgot/request-otp", requestForgotOtp);
router.post("/forgot/verify-otp", verifyForgotOtp);
router.post("/forgot/reset-password", resetPassword);
module.exports = router;
