const axios = require("axios");
const secret = require("../secret");
const ollama = axios.create({
  baseURL: secret.OLLAMA_API || "http://localhost:11434/api/chat", // make sure it's /chat
  headers: {
    "Content-Type": "application/json",
  },
});

module.exports = ollama;
