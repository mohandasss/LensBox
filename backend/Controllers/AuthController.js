const User = require("../Models/UserModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cloudinary = require("../Config/cloudanary");
const axios = require("axios");


const googleCallback = async (req, res) => {
  const code = req.query.code;

  if (!code) return res.status(400).json({ message: "Code not found in URL" });

  try {
    // 1. Exchange code for tokens
    const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: "http://localhost:5000/api/auth/google/callback",
      grant_type: "authorization_code",
    });

    const { access_token } = tokenRes.data;

    // 2. Get user info from Google
    const userInfo = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    const { email, name, picture } = userInfo.data;

    // 3. Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name,
        email,
        password: "google_oauth_dummy",
        profilePic: picture,
        phone: "",
        address: {
          city: "",
          state: "",
          zip: "",
          country: "",
        },
      });

      await user.save();
    }

    // 4. Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // 5. Redirect to frontend with token (or return JSON)
    res.redirect(`http://localhost:3000?token=${token}`);
    // Or: res.json({ token, user });

  } catch (err) {
    console.error("Google OAuth Error:", err.response?.data || err);
    res.status(500).json({ message: "OAuth failed", error: err.message });
  }
};





const registerUser = async (req, res) => {
  console.log(req.body);
  
  try {
    const {
      name,
      email,
      password,
      phone,
      city,
      state,
      zip,
      country,
      role,
    } = req.body;

    // 🛑 Validate Required Fields
    if (!name || !email || !password || !phone || !city || !state || !zip || !country) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // 🛑 Check If Image File Exists
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: "Profile image is required." });
    }
    
    
    const imageFile = req.files.image;

    // 🔍 Check if User Already Exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered." });
    }

    // ☁️ Upload Image to Cloudinary
    const uploadedResponse = await cloudinary.uploader.upload(imageFile.tempFilePath, {
      folder: "profilePictures",
    });

    // 🔒 Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Save New User to MongoDB
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role: role || 'user',
      address: {
        city,
        state,
        zip,
        country,
      },
      profilePic: uploadedResponse.secure_url,
    });

    await newUser.save();

    // 🔐 Generate JWT Token
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        profilePic: newUser.profilePic,
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * Handles avatar upload and updates the user's profile picture
 * Expects a base64 encoded image in the request body as { avatar: 'base64string' }
 */
const uploadAvatar = async (req, res) => {
  try {
    const userId = req.user.userId; // Get userId from authenticated user

    // Step 1: Check for uploaded file
    if (!req.files || !req.files.profilePic) {
      return res.status(400).json({ message: "Avatar image is required" });
    }

    const profilePic = req.files.profilePic;

    // Step 2: Optional – check for truncated upload
    if (profilePic.truncated) {
      return res.status(400).json({ message: "Image file too large or truncated" });
    }

    // Step 3: Upload to Cloudinary
    const result = await cloudinary.uploader.upload(profilePic.tempFilePath, {
      folder: "profilePictures",
    });

    // Step 4: Update user's profilePic
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: result.secure_url },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ 
      message: "Avatar updated successfully", 
      user: updatedUser,
      profilePic: updatedUser.profilePic // Ensure profilePic is included in the response
    });

  } catch (error) {
    console.error("Error updating avatar:", error);
    res.status(500).json({ 
      message: "Failed to update avatar",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Updates user profile information
 * Does not handle profile picture updates - use uploadAvatar for that
 */
const updateUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, phone, address = {} } = req.body;
    const { city, state, zip, country } = address;

    // Validate at least one field is being updated
    if (!name && !phone && !city && !state && !zip && !country) {
      return res.status(400).json({ message: "No update data provided" });
    }

    const updateData = {};
    
    // Basic info updates
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;

    // Address updates
    if (city || state || zip || country) {
      updateData.address = {};
      if (city) updateData.address.city = city;
      if (state) updateData.address.state = state;
      if (zip) updateData.address.zip = zip;
      if (country) updateData.address.country = country;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ 
      message: "Failed to update profile",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};






const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
  res.status(200).json({ message: "User logged in successfully", user, token });
};

const checkAuth = async (req, res) => {
  const token = req.headers.authorization;
  const bearerToken = token.split(" ")[1];

  if (!bearerToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET);
  const user = await User.findById(decoded.userId);

  res.status(200).json({ message: "User is authenticated", user });
};
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    
    
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



module.exports = {googleCallback , registerUser,uploadAvatar,updateUser, loginUser, deleteUser, checkAuth };
