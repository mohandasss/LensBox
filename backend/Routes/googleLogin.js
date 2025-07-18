const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../Models/UserModel');
const { uploadImageFromUrl } = require('../utils/cloudinary');
const router = express.Router();

// Start Google Auth
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Callback after Google login
router.get('/google/callback', passport.authenticate('google', { session: false }),
  async (req, res, next) => {
    try {
      const user = req.user;
      
      // If user has a Google profile picture, upload it to Cloudinary
      if (user.profilePic && user.profilePic.startsWith('http')) {
        try {
          const result = await uploadImageFromUrl(user.profilePic);
          
          // Update user with Cloudinary URL
          await User.findByIdAndUpdate(user._id, {
            cloudinaryUrl: result.secure_url,
            profilePic: result.secure_url // Also update profilePic with the Cloudinary URL
          });
          
          // Update the user object in the response
          user.cloudinaryUrl = result.secure_url;
          user.profilePic = result.secure_url;
        } catch (uploadError) {
          console.error('Error uploading profile picture to Cloudinary:', uploadError);
          // Continue with the login even if upload fails
        }
      }
      
      // Generate JWT token with user data
      const token = jwt.sign(
        { 
          userId: user._id,
          email: user.email,
          name: user.name,
          profilePic: user.cloudinaryUrl || user.profilePic,
          role: user.role
        }, 
        process.env.JWT_SECRET, 
        { expiresIn: "7d" }
      );

      // Redirect to frontend with token
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/google-login-success?token=${token}`);
    } catch (error) {
      console.error('Error in Google OAuth callback:', error);
      next(error);
    }
  }
);

module.exports = router;