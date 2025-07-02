const express = require("express");
const { spawn } = require('child_process');
const authRoutes = require("./Routes/AuthRoutes.js");
const connectDB = require("./Config/db.js");
const dotenv = require("dotenv");
const cors = require("cors");
const productRoutes = require("./Routes/ProductRoutes.js");
const categoryRoutes = require("./Routes/CategoryRoutes.js");
const subCategoryRoutes = require("./Routes/SubCategoryRoutes.js");
const brandRoutes = require("./Routes/BrandRoutes.js");
const fileUpload = require("express-fileupload");
const cartRoutes = require("./Routes/CartRoutes.js");
const chatRoute = require("./Routes/ChatRoutes.js");
const checkout = require("./Routes/checkout.js");
const wishlistRoutes = require("./Routes/wishlistRoutes.js");
const orderRoutes = require("./Routes/OrderRoutes.js");
const subscriberRoutes = require("./Routes/subscriberRoutes.js");
const adminRoutes = require("./Routes/adminRoutes.js");
const mailRoutes = require("./Routes/mailRoutes.js");

dotenv.config();
require('./Config/passport.js');

// Start Ollama server
const startOllama = () => {
  const ollama = spawn('ollama', ['serve']);
  
  ollama.stdout.on('data', (data) => {
    console.log(`Ollama: ${data}`);
  });

  ollama.stderr.on('data', (data) => {
    console.error(`Ollama Error: ${data}`);
  });

  ollama.on('close', (code) => {
    console.log(`Ollama process exited with code ${code}`);
  });

  process.on('exit', () => {
    ollama.kill();
  });

  return ollama;
};

// Start the Ollama server
const ollamaProcess = startOllama();
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
app.use('/api/checkout', checkout);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes)
app.use("/auth", googleLoginRoutes);
app.use('/api/mail', mailRoutes);
app.use('/api/', subscriberRoutes);
app.use('/api/admin', adminRoutes);

// Basic Route
app.get("/", (req, res) => {
  res.send("Hello, world!");
});

// Server Listener
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  // Server is running
});
