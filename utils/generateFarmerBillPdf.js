const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateFarmerBillPdf = (billData, outputPath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });

    doc.pipe(fs.createWriteStream(outputPath));

    // Header
    doc.fontSize(20).text('Farmer Redeem Product Invoice', { align: 'center' });
    doc.moveDown(1.5);

    // Farmer Details
    doc.fontSize(14).text('Farmer Details:', { underline: true });
    doc.fontSize(12).text(`Name: ${billData.farmerName || '-'}`);
    doc.text(`Phone: ${billData.farmerPhone || '-'}`);
    doc.text(`Address: ${billData.farmerAddress || '-'}`);
    doc.text(`City: ${billData.farmerCity || '-'}`);
    doc.text(`State: ${billData.farmerState || '-'}`);
    doc.moveDown();

    // Order Details
    doc.fontSize(14).text('Order Details:', { underline: true });
    doc.fontSize(12).text(`Order ID: ${billData.orderId}`);
    doc.text(`Farmer ID: ${billData.farmerId}`);
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

module.exports = generateFarmerBillPdf;
