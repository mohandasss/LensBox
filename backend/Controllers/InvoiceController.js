// controllers/invoiceController.js
const PDFDocument = require('pdfkit');
const Order = require('../Models/orderModel'); // Your Mongoose model
const fs = require('fs');
const path = require('path');
const generateInvoicePDF = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    console.log("📋 Received invoice request for order ID:", orderId);

    const order = await Order.findById(orderId).populate('items.productId');
    if (!order) return res.status(404).send('Order not found');

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${orderId}.pdf`);
    doc.pipe(res);

    // Helper function to draw a line
    const drawLine = (y) => {
      doc.moveTo(50, y).lineTo(545, y).stroke();
    };

    // Header with company name and invoice title
    doc
      .fontSize(32)
      .font('Helvetica-Bold')
      .text('Invoice', 50, 50)
      .fontSize(12)
      .font('Helvetica')
      .moveDown(2);

    // Company details (left side) and contact info (right side)
    const companyY = 120;
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Lensbox', 50, companyY)
      .fontSize(10)
      .font('Helvetica')
      .text('B-6, Kolkata', 50, companyY + 20)
      .text('West Bengal, 700001', 50, companyY + 35);

    // Contact details (right aligned)
    doc
      .text('+91-6295631554', 400, )
      .text('contact@lensbox.in', 400, companyY + 15)
      .text('lensbox.in', 400, companyY + 30);

    // Bill To and Invoice Details sections
    const billToY = 200;
    
    // Bill To section (left)
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#666666')
      .text('Bill To', 50, billToY)
      .fontSize(10)
      .font('Helvetica')
      .fillColor('black')
      .text(order.customerDetails?.fullName || 'N/A', 50, billToY + 20)
      .text(order.customerDetails?.addressLine1 || 'N/A', 50, billToY + 35)
      .text(`${order.customerDetails?.city || ''}, ${order.customerDetails?.state || ''}`, 50, billToY + 50)
      .text(`${order.customerDetails?.country || ''} ${order.customerDetails?.zipcode || ''}`, 50, billToY + 65);

    // Invoice Details section (right)
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#666666')
      .text('Invoice Details', 350, billToY)
      .fontSize(10)
      .font('Helvetica')
      .fillColor('black')
      .text(`Invoice # ${order._id.toString().slice(-6)}`, 350, billToY + 20)
      .text('Terms Net 30', 350, billToY + 35)
      .text(`Invoice date ${new Date(order.createdAt).toLocaleDateString('en-US')}`, 350, billToY + 50)
      .text(`Due date ${new Date(order.customerDetails?.endDate || order.createdAt).toLocaleDateString('en-US')}`, 350, billToY + 65);

    // Items table
    const tableTop = 320;
    const tableHeaders = ['Product/Services', 'Qty/Hrs', 'Rate', 'Amount'];
    const colWidths = [250, 80, 80, 80];
    const colPositions = [50, 300, 380, 460];

    // Table header background
    doc
      .rect(50, tableTop - 5, 495, 25)
      .fillColor('#f5f5f5')
      .fill()
      .fillColor('black');

    // Table headers
    doc
      .fontSize(10)
      .font('Helvetica-Bold');
    
    tableHeaders.forEach((header, i) => {
      const align = i === 0 ? 'left' : 'right';
      doc.text(header, colPositions[i], tableTop + 5, { 
        width: colWidths[i], 
        align: align 
      });
    });

    // Table header line
    drawLine(tableTop + 20);

    // Table rows
    let currentY = tableTop + 35;
    let subtotal = 0;

    order.items.forEach((item) => {
      const productName = item.productId?.name || 'Unknown Product';
      const quantity = item.quantity || 1;
      const rate = item.amount ? (item.amount / quantity) : 0;
      const amount = item.amount || 0;
      
      subtotal += amount;

      doc
        .fontSize(9)
        .font('Helvetica')
        .text(productName, colPositions[0], currentY, { width: colWidths[0] })
        .text(quantity.toString(), colPositions[1], currentY, { width: colWidths[1], align: 'right' })
        .text(`₹${rate.toFixed(2)}`, colPositions[2], currentY, { width: colWidths[2], align: 'right' })
        .text(`₹${amount.toFixed(2)}`, colPositions[3], currentY, { width: colWidths[3], align: 'right' });

      currentY += 25;
    });

    // Table bottom line
    drawLine(currentY + 5);

    // Totals section
    const totalsY = currentY + 25;
    const totalsLabelsX = 380; // Left position for labels
    const totalsAmountsX = 460; // Right position for amounts

    // Get values from order
    const discount = order.discount || 0;
    const total = order.total || 0;
    
    // Calculate rental duration (inclusive of both start and end dates)
    const startDate = new Date(order.startDate || order.createdAt);
    const endDate = new Date(order.endDate || order.customerDetails?.endDate || order.createdAt);
    const rentalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates

    doc
      .fontSize(10)
      .font('Helvetica')
      .text('Rental Duration', totalsLabelsX, totalsY)
      .text(`${rentalDays} day${rentalDays > 1 ? 's' : ''}`, totalsAmountsX, totalsY, { width: 80, align: 'right' })
      
      .text('Subtotal', totalsLabelsX, totalsY + 20)
      .text(`₹${subtotal.toFixed(2)}`, totalsAmountsX, totalsY + 20, { width: 80, align: 'right' })
      
      .text('Discount', totalsLabelsX, totalsY + 40)
      .text(`-₹${discount.toFixed(2)}`, totalsAmountsX, totalsY + 40, { width: 80, align: 'right' })
      
    // Total line
    drawLine(totalsY + 65);

    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Total', totalsLabelsX, totalsY + 80)
      .text(`₹${total.toFixed(2)}`, totalsAmountsX, totalsY + 80, { width: 80, align: 'right' });

    // Payment details section
    const paymentY = totalsY + 120;
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#666666')
      .text('Payment Details', 50, paymentY)
      .fontSize(9)
      .font('Helvetica')
      .fillColor('black')
      .text(`Order ID: ${order.razorpay?.orderId || 'N/A'}`, 50, paymentY + 20)
      .text(`Payment ID: ${order.razorpay?.paymentId || 'N/A'}`, 50, paymentY + 35)
      .text('Status:', 50, paymentY + 50)
      .rect(90, paymentY + 45, 40, 15)
      .fillAndStroke('#4CAF50', '#4CAF50')
      .fillColor('white')
      .fontSize(9)
      .text(order.razorpay?.status || 'Paid', 95, paymentY + 47, { width: 30, align: 'center' })
      .fillColor('black');

    // Footer signature space
    const footerY = paymentY + 100;
    const signatureX = 400; // Aligned with the right side amounts
    
    if (order.paymentDetails?.signature) {
      doc
        .fontSize(10)
        .text('Signature', signatureX, footerY, { align: 'right', width: 150 })
        .moveDown(0.3)
        .fontSize(8)
        .text('Digital Signature:', signatureX, footerY + 15, { align: 'right', width: 150 })
        .text(order.paymentDetails.signature.substring(0, 50) + '...', signatureX, footerY + 30, { align: 'right', width: 150 });
    }

    // Add signature image if exists
    const signaturePath = path.join(__dirname, '../assets/signaturehey.jpg');
    if (fs.existsSync(signaturePath)) {
      doc.image(signaturePath, 400, footerY, { width: 100 });
    }

    doc.end();

  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).send('Failed to generate invoice');
  }
};


module.exports = { generateInvoicePDF };