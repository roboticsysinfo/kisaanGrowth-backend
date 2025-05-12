const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateCustomerBillPdf = (billData, outputPath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });

    doc.pipe(fs.createWriteStream(outputPath));

    // Header
    doc.fontSize(20).text('Redeem Product Invoice', { align: 'center' });
    doc.moveDown(1.5);

    // Customer Details
    doc.fontSize(14).text('Customer Details:', { underline: true });
    doc.fontSize(12).text(`Name: ${billData.customerName || '-'}`);
    doc.text(`Phone: ${billData.customerPhone || '-'}`);
    doc.text(`Address: ${billData.customerAddress || '-'}`);
    doc.text(`City: ${billData.customerCity || '-'}`);
    doc.text(`State: ${billData.customerState || '-'}`);
    doc.moveDown();

    // Order Details
    doc.fontSize(14).text('Order Details:', { underline: true });
    doc.fontSize(12).text(`Order ID: ${billData.orderId}`);
    doc.text(`Customer ID: ${billData.customer_Id}`);
    doc.text(`Date: ${new Date(billData.billGeneratedAt).toLocaleString()}`);
    doc.moveDown();

    // Table Design for Product and Price Details
    doc.fontSize(14).text('Product Details:', { underline: true });
    doc.moveDown();

    const tableTop = doc.y;
    const columnWidth = [100, 150, 100, 100]; // Width for each column (Product, Price, GST, Total)
    const rowHeight = 20;

    // Table Header
    doc.fontSize(12).text('Product', columnWidth[0], tableTop);
    doc.text('Price', columnWidth[0] + columnWidth[1], tableTop);
    doc.text('GST (18%)', columnWidth[0] + columnWidth[1] + columnWidth[2], tableTop);
    doc.text('Total', columnWidth[0] + columnWidth[1] + columnWidth[2] + columnWidth[3], tableTop);
    doc.moveDown(0.5);

    // Table rows (products)
    billData.products.forEach((product, index) => {
      const yPosition = tableTop + rowHeight * (index + 1);
      doc.text(product.name, columnWidth[0], yPosition);
      doc.text(`₹${product.price}`, columnWidth[0] + columnWidth[1], yPosition);
      doc.text(`₹${product.gstAmount}`, columnWidth[0] + columnWidth[1] + columnWidth[2], yPosition);
      doc.text(`₹${product.total}`, columnWidth[0] + columnWidth[1] + columnWidth[2] + columnWidth[3], yPosition);
    });

    // Total Summary
    doc.moveDown(1);
    doc.text(`Subtotal: ₹${billData.subtotal}`);
    doc.text(`Total (Incl. GST): ₹${billData.totalAmount}`);
    doc.end();

    doc.on('finish', () => resolve());
    doc.on('error', (err) => reject(err));
  });
};

module.exports = generateCustomerBillPdf;
