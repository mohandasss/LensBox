const User = require("../Models/UserModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const registerUser = async (req, res) => {
  try {
    const { name, email, password, address, phone, city, state, zip, role, country } =
      req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      address,
      phone,
      country,
      city,
      state,
      zip,
      role
      
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.user.userId; // Extracted from token via middleware
    const {
      name,
      address,
      phone,
      country,
      city,
      state,
      zip,
    } = req.body;

    const updatedFields = {
      ...(name && { name }),
      ...(address && { address }),
      ...(phone && { phone }),
      ...(country && { country }),
      ...(city && { city }),
      ...(state && { state }),
      ...(zip && { zip }),
    };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updatedFields },
      { new: true }
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
    res.status(500).json({ message: "Server error" });
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



module.exports = { registerUser,updateUser, loginUser, deleteUser, checkAuth };
