// Import express module
const express = require('express');
const authRoutes = require("./Routes/AuthRoutes");
const connectDB = require("./Config/db");
const dotenv = require("dotenv");
const cors = require("cors");
const productRoutes = require("./Routes/ProductRoutes");
const categoryRoutes = require("./Routes/CategoryRoutes.js");
const subCategoryRoutes = require("./Routes/SubCategoryRoutes.js");
const brandRoutes = require("./Routes/BrandRoutes.js");




dotenv.config();

// Create an Express app
const app = express();


connectDB();

app.use(cors({
  origin: 'http://localhost:3000', // Allow only requests from localhost:3000
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow the methods you want
  credentials: true, // Allow cookies if needed
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route imports
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/subcategories", subCategoryRoutes);
app.use("/api/brands", brandRoutes);


// Define a basic route
app.get('/', (req, res) => {
  res.send('Hello, world!');
});


// Set the server to listen on port 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
