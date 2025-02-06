// Import express module
const express = require('express');

// Create an Express app
const app = express();

// Define a basic route
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

// Set the server to listen on port 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
