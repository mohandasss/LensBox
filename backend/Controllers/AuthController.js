const User = require("../Models/UserModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const registerUser = async (req, res) => {
  try {
      const { name, email, password, address, phone, city, state, zip, country } = req.body;

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
          city,
          state,
          zip,
          country,
      });

      await newUser.save();


      // Generate JWT token
      const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

      res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
      console.error(error);
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
  console.log(bearerToken);
  if (!bearerToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }


  const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET);
  const user = await User.findById(decoded.userId);
  console.log(user);
  res.status(200).json({ message: "User is authenticated", user });


};

module.exports = { registerUser, loginUser, checkAuth };
