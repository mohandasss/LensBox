const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Start Google Auth
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Callback after Google login
router.get('/google/callback', passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Redirect to frontend with token
    res.redirect(`http://localhost:3000/google-login-success?token=${token}`);
  }
);

module.exports = router;
