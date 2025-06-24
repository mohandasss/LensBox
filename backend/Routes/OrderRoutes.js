require('dotenv').config();
const express = require("express");
const router = express.Router();
const { getAllOrders } = require("../Controllers/OrderController");
const { authMiddleware } = require("../middlewares/AuthMiddleware");
const  {generateInvoicePDF}  = require('../Controllers/invoiceController');

router.get("/:userId", authMiddleware, getAllOrders);
router.get('/:orderId/invoice', authMiddleware, generateInvoicePDF);

module.exports = router;