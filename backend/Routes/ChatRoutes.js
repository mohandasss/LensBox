const express = require('express');
const router = express.Router();
const { handleChat } = require('../Controllers/ChatController');

router.post('/chat', handleChat);

module.exports = router;
