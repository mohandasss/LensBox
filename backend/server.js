const express = require("express");
const authRoutes = require("./Routes/AuthRoutes");
const connectDB = require("./Config/db");
const dotenv = require("dotenv");
const cors = require("cors");
const productRoutes = require("./Routes/ProductRoutes");
const categoryRoutes = require("./Routes/CategoryRoutes.js");
const subCategoryRoutes = require("./Routes/SubCategoryRoutes.js");
const brandRoutes = require("./Routes/BrandRoutes.js");
const fileUpload = require("express-fileupload");
const cartRoutes = require("./Routes/CartRoutes");
const chatRoute = require("./Routes/ChatRoutes");
dotenv.config();
require('./Config/passport');
const googleLoginRoutes = require('./Routes/googleLogin.js');

const passport = require('passport');
const session = require('express-session');
const app = express();

// Connect to MongoDB
connectDB();

// CORS Configuration
app.use(
  cors({
    origin: "http://localhost:3000", // Allow only requests from localhost:3000
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    credentials: true, // Allow cookies
  })
);

// Middleware Setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size (5MB)
  })
);


app.use(session({
  secret: 'someSecret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
// Route Imports
app.use('/api/auth', googleLoginRoutes);
app.use('/api', chatRoute); 
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/subcategories", subCategoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/cart", cartRoutes);
// Basic Route
app.get("/", (req, res) => {
  res.send("Hello, world!");
});

// Server Listener
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
