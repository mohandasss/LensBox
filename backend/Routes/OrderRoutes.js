require('dotenv').config();
const express = require("express");
const router = express.Router();
const { getAllOrders } = require("../Controllers/OrderController");
const { authMiddleware } = require("../middlewares/AuthMiddleware");
const  {generateInvoicePDF}  = require('../Controllers/InvoiceController');

router.get("/:userId", authMiddleware, getAllOrders);
router.get('/:orderId/invoice', authMiddleware, generateInvoicePDF);

module.exports = router;