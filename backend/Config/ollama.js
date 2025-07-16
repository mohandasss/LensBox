const axios = require("axios");
const ollama = axios.create({
  baseURL: process.env.OLLAMA_API || "http://localhost:11434/api/chat", // make sure it's /chat
  headers: {
    "Content-Type": "application/json",
  },
});

module.exports = ollama;
