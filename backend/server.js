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
const sellerRoutes = require("./Routes/SellerRoutes.js");
const testSellerRoutes = require("./Routes/TestSellerRoutes.js");
const mailRoutes = require("./Routes/mailRoutes.js");
const reviewRoutes = require("./Routes/ReviewRoutes.js");
const stockNotificationRoutes = require("./Routes/stockNotificationRoutes.js");
const heatmapRoutes = require("./Routes/heatmapRoutes.js");

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

// Only start Ollama in development environment and not in production or serverless environments
if (process.env.NODE_ENV !== 'production' && require.main === module) {
  console.log("Starting Ollama in development mode");
  startOllama();
} else {
  console.log("Skipping Ollama in production environment");
}
const googleLoginRoutes = require('./Routes/googleLogin.js');

const passport = require('passport');
const session = require('express-session');
const app = express();

// Connect to MongoDB
connectDB();

// CORS Configuration
// CORS Configuration
app.use(
  cors({
    origin: [
      "https://frontend-eight-omega-86.vercel.app",
      "https://frontend-6f00pf2nf-bwumca24133-5151s-projects.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

//he

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
app.use('/api/seller', sellerRoutes);
app.use('/api/test-seller', testSellerRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/stock-notifications", stockNotificationRoutes);
app.use("/api/heatmap", heatmapRoutes);

// Basic Route
app.get("/", (req, res) => {
  res.send("Hello, world!");
});

// Only start the server if not running in Vercel (i.e., not in a serverless environment)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;