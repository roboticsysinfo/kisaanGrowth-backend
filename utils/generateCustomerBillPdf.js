const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateCustomerBillPdf = (billData, outputPath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();

    doc.pipe(fs.createWriteStream(outputPath));

    doc.fontSize(20).text('Redeem Product Invoice', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Order ID: ${billData.orderId}`);
    doc.text(`Customer ID: ${billData.customer_Id}`);
    doc.text(`Product: ${billData.productName}`);
    doc.text(`Price: ₹${billData.priceValue}`);
    doc.text(`GST (18%): ₹${billData.gstAmount}`);
    doc.text(`Total: ₹${billData.totalAmount}`);
    doc.text(`Date: ${new Date(billData.billGeneratedAt).toLocaleString()}`);

    doc.end();

    doc.on('finish', () => resolve());
    doc.on('error', (err) => reject(err));
  });
};

module.exports = generateCustomerBillPdf;
