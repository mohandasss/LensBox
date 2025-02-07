// Import express module
const express = require('express');
const authRoutes = require("./Routes/AuthRoutes");
const connectDB = require("./Config/db");
const dotenv = require("dotenv");

dotenv.config();

// Create an Express app
const app = express();

connectDB();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route imports
app.use("/api/auth", authRoutes);


// Define a basic route
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

// Set the server to listen on port 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
